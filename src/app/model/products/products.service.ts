import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { b2bShared } from 'src/integration/b2b-shared';
import { b2bProducts } from 'src/integration/products/b2b-products';
import { DisplayType } from '../enums/display-type.enum';
import { Pagination } from '../shared/pagination';
import { PriceMode } from '../enums/price-mode.enum';
import { Subscription, Observable, combineLatest, of } from 'rxjs';
import { ProductsRequestsService } from '../product/products-requests.service';
import { Subject } from 'rxjs';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { GlobalFilterType } from '../shared/enums/global-filter-type.enum';
import { GlobalOthersFilterType } from '../shared/enums/global-others-filter-type.enum';
import { StockLevelFilterType } from '../shared/enums/stock-level-filter-type.enum';
import { CommonService } from '../shared/common/common.service';
import { catchError, map, tap } from 'rxjs/operators';
import { FilterSetModalStatus } from '../product/enums/filter-set-modal-status.enum';
import { UpdateFilterSetsExtraActionType } from '../product/enums/update-filter-sets-extra-action-type.enum';
import { ProductsFiltersSetsService } from '../product/products-filters-sets.service';
import { CacheService } from '../cache.service';
import { ProductStatus } from '../product/enums/product-status.enum';
import { ProductSortMode } from '../product/enums/products-sort-mode.enum';
import { ProductBase } from '../shared/product-base/product-base';
import { b2b } from 'src/b2b';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { WarehousesService } from '../warehouses.service';
import { AccountService } from '../account.service';
import { ApplicationType } from '../enums/application-type.enum';
import { MenuService } from '../menu.service';
import { ProductDetailsRequestsService } from '../product/product-details-requests.service';
import { Config } from 'src/app/helpers/config';
import { ERPService } from '../shared/erp/erp.service';
import { ConfigService } from '../config.service';

/**
 * Service for product's list
 */
@Injectable({
    providedIn: 'root'
})
export class ProductsService extends ProductBase {
    groupId: number;

    config: b2bShared.ProductListConfig;

    searchPhrase = '';

    private _currentFiltersSummary: b2bProducts.CurrentSelectedFiltersValuesSummary;
    get currentFiltersSummary() { return this._currentFiltersSummary; }

    products: b2b.GenericCollection<number, b2b.ProductListElement>;

    get productsLength(): number {
        if (this.products) {
            return Object.keys(this.products).length;
        }
        return 0;
    }


    pagination: Pagination;

    unitsLoaded: boolean;

    logInSub: Subscription;
    logOutSub: Subscription;

    private pricesPromisesData: b2b.GenericCollection<number, b2b.PromiseData<b2b.Prices>>;
    private unitsPromise: Promise<b2b.Collection<b2bProducts.articleUnitList[]>>;
    private unitsPromiseResolve: Function;
    private unitsPromiseReject: Function;

    private _suggestions: b2bProducts.SuggestionBase[];
    suggestionsChanged: Subject<b2bProducts.SuggestionBase[]>;

    private unitsChanged: Subject<void>;
    unitsChanged$: Observable<void>;

    private _filtersPerArticleGroupChanged: Subject<b2bProductsFilters.ArticleGroupFilter[]>;
    filtersChanged$: Observable<b2bProductsFilters.FiltersSummary>;

    private _filterSetsChanged: Subject<b2bProductsFilters.FilterSetsSummary>;
    filterSetsChanged$: Observable<b2bProductsFilters.FilterSetsSummary>;

    private _filterSetActionPerformed: Subject<b2bProductsFilters.FilterSetActionStatus>;
    filterSetActionPerformed$: Observable<b2bProductsFilters.FilterSetActionStatus>;

    constructor(
        httpClient: HttpClient,
        configService: ConfigService,
        warehousesService: WarehousesService,
        private accountService: AccountService,
        private productsRequestsService: ProductsRequestsService,
        private productDetailsRequestsService: ProductDetailsRequestsService,
        private menuService: MenuService,
        private commonService: CommonService,
        private productsFiltersSetsService: ProductsFiltersSetsService,
        private cacheService: CacheService,
        protected erpService: ERPService) {
        super(httpClient, warehousesService, configService, erpService);

        this.pagination = new Pagination();
        this.suggestionsChanged = new Subject();
        this.unitsChanged = new Subject();
        this.unitsChanged$ = this.unitsChanged as Observable<void>;

        this._filtersPerArticleGroupChanged = new Subject();
        this.filtersChanged$ = combineLatest([this.commonService.globalFiltersChanged$, this._filtersPerArticleGroupChanged]).pipe(
            map((result) => {
                let globalFilters = result[0] as b2bProductsFilters.GlobalFilter[];
                globalFilters = this.prepareGlobalFiltersSelectedValues(globalFilters);

                const articleGroupFilters = result[1] as b2bProductsFilters.ArticleGroupFilter[];
                return { globalFilters, articleGroupFilters };
            }));

        this._filterSetsChanged = new Subject();
        this.filterSetsChanged$ = this._filterSetsChanged as Observable<b2bProductsFilters.FilterSetsSummary>;

        this._filterSetActionPerformed = new Subject<b2bProductsFilters.FilterSetActionStatus>();
        this.filterSetActionPerformed$ = this._filterSetActionPerformed as Observable<b2bProductsFilters.FilterSetActionStatus>;

        this.config = this.prepareProductsConfig();
        this.inCaseUserLogOut();
    }

    private prepareProductsConfig(): b2bShared.ProductListConfig {
        return {
            displayType: Number(localStorage.getItem('displayType')) || DisplayType.quickShopping,
        };
    }

    private inCaseUserLogOut() {
        this.logOutSub = this.accountService.logOutSubj.subscribe(() => {
            this.products = undefined;
            this.groupId = undefined;
            this.clearCurrentFiltersSummary();
        });
    }

    getArticleList(groupId: number): Promise<void> {
        this.products = {};
        this.pricesPromisesData = {};

        this.unitsPromise = new Promise<b2b.Collection<b2bProducts.articleUnitList[]>>((resolve, reject) => {
            this.unitsPromiseResolve = resolve;
            this.unitsPromiseReject = reject;
        });
        this.unitsLoaded = false;

        switch (this.configService.applicationId) {

            case ApplicationType.ForXL:
                return this.getArticleListXl(groupId);
            case ApplicationType.ForAltum:
                return this.getArticleListAltum(groupId);
            default:
                console.error(`getArticleList(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private prepareGetArticleListBaseRequest(groupId: number): b2bProducts.GetArticleListBaseRequest {
        return {
            groupId,
            filterInGroup: false,
            pageNumber: this.pagination.currentPage,
            onlyAvailable: this.currentFiltersSummary.globalFilters.onlyAvailable,
            stockLevelFilter: this.currentFiltersSummary.globalFilters.stockLevelFilter,
            warehouseId: this.currentFiltersSummary.globalFilters.warehouseId,
            filter: this.searchPhrase || '',
            sortMode: this.currentFiltersSummary.sortMode,
        };
    }

    private getArticleListXl(groupId: number) {
        this.groupId = groupId;
        const request = this.prepareGetArticleListBaseRequest(groupId);
        return this.productsRequestsService.getArticleListXlRequest(request).then(res => this.inCaseSuccessGetArticleListXl(res, groupId));
    }

    private getArticleListAltum(groupId: number) {
        this.groupId = groupId;
        const request = this.prepareGetArticleListBaseRequest(groupId);
        return this.productsRequestsService.getArticleListAltumRequest(request).then(res => this.inCaseSuccessGetArticleListAltum(res, groupId));
    }

    private inCaseSuccessGetArticleListXl(response: b2bProducts.GetArticleListXlResponse, groupId: number) {
        this.inCaseSuccessGetArticleListBase(response, groupId);
        this.updateArticlesXl(response.articleList);
    }

    private inCaseSuccessGetArticleListAltum(response: b2bProducts.GetArticleListAltumResponse, groupId: number) {
        this.inCaseSuccessGetArticleListBase(response, groupId);
        this.updateArticlesAltum(response.articleList);
    }

    private inCaseSuccessGetArticleListBase(response: b2bProducts.GetArticleListBaseResponse, groupId: number) {
        this.pagination.changeParams(response.paging);
    }

    getArticleListWithFilters(): Promise<void> {
        this.products = {};
        this.pricesPromisesData = {};

        this.unitsPromise = new Promise<b2b.Collection<b2bProducts.articleUnitList[]>>((resolve, reject) => {
            this.unitsPromiseResolve = resolve;
            this.unitsPromiseReject = reject;
        });
        this.unitsLoaded = false;

        switch (this.configService.applicationId) {

            case ApplicationType.ForXL:
                return this.getArticleListWithFiltersXl();
            case ApplicationType.ForAltum:
                return this.getArticleListWithFiltersAltum();
            default:
                console.error(`getArticleListWithFilters(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private prepareGetArticleListWithFiltersBaseRequest(): b2bProducts.GetArticleListWithGroupFiltersBaseRequest {
        return {
            groupId: this.groupId,
            onlyAvailable: this.currentFiltersSummary.globalFilters.onlyAvailable,
            pageNumber: this.pagination.currentPage,
            stockLevelFilter: this.currentFiltersSummary.globalFilters.stockLevelFilter,
            warehouseId: this.currentFiltersSummary.globalFilters.warehouseId,
            filters: this.currentFiltersSummary.articleGroupFilters?.length > 0 ? this.currentFiltersSummary.articleGroupFilters : null,
            sortMode: this.currentFiltersSummary.sortMode,
        };
    }

    private getArticleListWithFiltersXl() {
        const request = this.prepareGetArticleListWithFiltersBaseRequest();
        return this.productsRequestsService.getArticleListWithGroupFiltersXlRequest(request).then(res => this.inCaseSuccessGetArticleListXl(res, this.groupId));
    }

    private getArticleListWithFiltersAltum() {
        const request = this.prepareGetArticleListWithFiltersBaseRequest();
        return this.productsRequestsService.getArticleListWithGroupFiltersAltumRequest(request).then(res => this.inCaseSuccessGetArticleListAltum(res, this.groupId));
    }


    private updateArticlesXl(updatedArticles: b2bProducts.ArticleListItemXl[]) {
        if (!updatedArticles || updatedArticles.length === 0) {
            return;
        }

        updatedArticles.forEach((updatedArticle: b2bProducts.ArticleListItemXl) => {
            this.updateArticleXl(this.products[updatedArticle.article.id], updatedArticle);
        });
    }

    private updateArticlesAltum(updatedArticles: b2bProducts.ArticleListItemAltum[]) {
        if (!updatedArticles || updatedArticles.length === 0) {
            return;
        }

        updatedArticles.forEach((updatedArticle: b2bProducts.ArticleListItemAltum) => {
            this.updateArticleAltum(this.products[updatedArticle.article.id], updatedArticle);
        });
    }

    private updateArticleXl(currentArticle: b2b.ProductListElement, updatedArticle: b2bProducts.ArticleListItemXl) {
        this.products[updatedArticle.article.id] = {
            ...this.updateArticleBase(currentArticle, updatedArticle),
            flag: updatedArticle.flag
        };

        this.fillPricesAndUnitsDataXl(updatedArticle.article.id);
    }

    private updateArticleAltum(currentArticle: b2b.ProductListElement, updatedArticle: b2bProducts.ArticleListItemAltum) {
        this.products[updatedArticle.article.id] = this.updateArticleBase(currentArticle, updatedArticle);
        this.fillPricesAndUnitsDataAltum(updatedArticle.article.id);
    }

    private updateArticleBase(currentArticle: b2b.ProductListElement, updatedArticle: b2bProducts.ArticleListItemBase): b2b.ProductListElement {
        const pricesPromisesEl = <b2b.PromiseData<b2b.Prices>>{};
        const promise = new Promise<b2b.Prices>((resolve, reject) => {
            pricesPromisesEl.promiseResolve = resolve;
            pricesPromisesEl.promiseReject = reject;
        });
        pricesPromisesEl.promise = promise;

        this.pricesPromisesData[updatedArticle.article.id] = pricesPromisesEl;

        return {
            ...currentArticle,
            discountAllowed: updatedArticle.article.discountPermission,
            rowNumber: updatedArticle.rowNumber,
            code: updatedArticle.article.code.representsExistingValue ? updatedArticle.article.code.value : '',
            id: updatedArticle.article.id,
            image: updatedArticle.article.image,
            imageWidth: Config.defaultArticleListImageWidth,
            imageHeight: Config.defaultArticleListImageHeight,
            name: updatedArticle.article.name,
            type: updatedArticle.article.type,
            status: updatedArticle.status,
            pricesLoaded: !this.configService.permissions.hasAccessToPriceList,
            quantityChanged: false,
            noLink: false,
            quantity: (this.config.displayType === DisplayType.quickShopping) ? 0 : 1,
            min: (this.config.displayType === DisplayType.quickShopping) ? 0 : -1,
            extensions: updatedArticle.extensions,
            objectExtension: updatedArticle.objectExtension
        };
    }


    loadUnitsForMany(ids: number[]) {

        if (this.unitsLoaded) {

            const ids: b2b.UnitResponse[] = [];
            Object.values(this.products).forEach(product => {
                product.units.forEach((unit, unitNo) => {
                    ids.push({ id: product.id, no: unitNo, unit: unit.auxiliaryUnit });
                });
            });

            this.unitsPromiseResolve(ids);
            return of(<b2b.Collection<b2bProducts.GetUnitResponse>>{});
        }

        return this.requestUnitsForManyAndGroupById(ids)
            .pipe(
                catchError(err => {
                    this.unitsLoaded = true;
                    this.unitsPromiseReject(err);
                    return of(<b2b.Collection<b2bProducts.GetUnitResponse>>{});
                }),
                tap(res => {
                    this.unitsLoaded = true;
                    this.unitsPromiseResolve(res);
                    return res;
                })
            )

    }


    convertUnits(productId: number, unitId: number): void {
        if (this.hasCachedUnitsData(productId, unitId)) {
            this.fillCachedUnitsData(productId, unitId);
        } else {
            this.convertUnitsRequest(productId, unitId);
        }
    }

    private hasCachedUnitsData(productId: number, unitId: number) {
        const unitData = this.products[productId].units.get(unitId);
        return unitData && unitData.areUnitDataFilled;
    }

    private fillCachedUnitsData(productId: number, unitId: number) {
        const unitData = this.products[productId].units.get(unitId);
        this.products[productId] = {
            ...this.products[productId],
            ...unitData
        };
        this.unitsChanged.next();
    }

    //TODO - temp sollution, finally `convertUnitsRequest` should be in one place, and shared by product list and details
    private convertUnitsRequest(productId: number, unitId: number) {
        const request = this.prepareConvertUnitsBaseRequest(productId, unitId);
        this.products[productId].unitsLoaded = false;

        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.convertUnitsXlRequest(request);
            case ApplicationType.ForAltum:
                return this.convertUnitsAltumRequest(request);
            default:
                console.error(`convertUnits(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private prepareConvertUnitsBaseRequest(productId: number, unitId: number): b2bProductDetails.ConvertUnitsBaseRequest {
        return {
            id: productId,
            unitId,
            warehouseId: this.currentFiltersSummary.globalFilters.warehouseId
        };
    }

    private convertUnitsXlRequest(request: b2bProductDetails.ConvertUnitsBaseRequest): void {
        this.productDetailsRequestsService.unitConverterXlRequest(request).subscribe({
            next: this.inCaseSuccessConvertUnitsBase.bind(this, request.id),
            error: this.inCaseErrorConvertUnitsBase.bind(this, request.id),
        });
    }

    private convertUnitsAltumRequest(request: b2bProductDetails.ConvertUnitsBaseRequest): void {
        this.productDetailsRequestsService.unitConverterAltumRequest(request).subscribe({
            next: this.inCaseSuccessConvertUnitsBase.bind(this, request.id),
            error: this.inCaseErrorConvertUnitsBase.bind(this, request.id)
        });
    }

    private inCaseSuccessConvertUnitsBase(productId: number, response: b2bProductDetails.ConvertUnitsBaseResponse) {
        this.products[productId] = {
            ...this.updateProductDetailsBase(this.products[productId], response),
            unitsLoaded: true,
        };
        this.unitsChanged.next();
    }

    private inCaseErrorConvertUnitsBase(productId: number, err: HttpErrorResponse) {
        if (err.status === 204) {
            this.setArticleNotExistInCurrentPriceList(productId);
        }
        this.unitsChanged.next();
    }

    private setArticleNotExistInCurrentPriceList(productId: number) {
        this.products[productId] = {
            rowNumber: this.products[productId].rowNumber,
            id: this.products[productId].id,
            name: this.products[productId].name,
            code: this.products[productId].code,
            type: this.products[productId].type,
            status: ProductStatus.NotAvailable,
            noLink: true,
            pricesLoaded: true,
            unitsLoaded: true,
            itemExistsInCurrentPriceList: false,
        };
    }


    getArticleFromList(productId: number): Promise<void> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getArticleFromListXl(productId);
            case ApplicationType.ForAltum:
                return this.getArticleFromListAltum(productId);
            default:
                console.error(`getArticleFromList(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }


    private getArticleFromListXl(productId: number): Promise<void> {
        const request = this.prepareGetArticleFromListBaseRequest(productId);
        return this.productsRequestsService.getArticleFromListXlRequest(request)
            .then(res => this.inCaseSuccessGetArticleFromListBase(productId, res))
            .catch(err => this.inCaseGetArticleFromListException(err, productId));
    }

    private getArticleFromListAltum(productId: number): Promise<void> {
        const request = this.prepareGetArticleFromListBaseRequest(productId);
        return this.productsRequestsService.getArticleFromListAltumRequest(request)
            .then(res => this.inCaseSuccessGetArticleFromListBase(productId, res))
            .catch(err => this.inCaseGetArticleFromListException(err, productId));
    }

    private inCaseSuccessGetArticleFromListBase(productId: number, pricesResponse: any) {
        if (!this.pricesPromisesData[productId]) {
            return;
        }

        this.pricesPromisesData[productId].promiseResolve({ prices: pricesResponse, index: productId });
    }

    private prepareGetArticleFromListBaseRequest(productId: number): b2bProducts.GetArticleFromListBaseRequest {
        return {
            articleId: productId,
            warehouseId: this.currentFiltersSummary.globalFilters.warehouseId,
        };
    }

    private inCaseGetArticleFromListException(err: HttpErrorResponse, productId: number): void {
        if (err.status === 204) {
            this.setArticleNotExistInCurrentPriceList(productId);

            return;
        }

        this.pricesPromisesData[productId].promiseReject({ prices: err, index: productId });
        return;
    }

    /** ------------------- Units */

    private fillPricesAndUnitsDataXl(productId: number) {

        Promise.all([this.unitsPromise, this.pricesPromisesData[productId].promise]).then(res => {

            const groupedUnits: b2b.Collection<b2bProducts.articleUnitList[]> = res[0];
            const pricesResponse: b2bProducts.GetArticleFromListXlResponse = res[1].prices;

            this.fillUnitsForList(productId, groupedUnits[productId][0]);
            this.updateArticleDetailsXl(productId, pricesResponse);

            this.products[productId].pricesLoaded = true;
            this.unitsLoaded = true;

        }).catch(err => {
            this.fillPricesAndUnitsDataExceptionHandling(err, productId);
        });
    }

    private fillPricesAndUnitsDataAltum(productId: number) {

        Promise.all([this.unitsPromise, this.pricesPromisesData[productId].promise]).then(res => {

            const groupedUnits: b2b.Collection<b2bProducts.articleUnitList[]> = res[0];
            const pricesResponse: b2bProducts.GetArticleFromListAltumResponse = res[1].prices;

            this.fillUnitsForList(productId, groupedUnits[productId][0]);
            this.updateArticleDetailsAltum(productId, pricesResponse);

            this.products[productId].pricesLoaded = true;
            this.unitsLoaded = true;

        }).catch(err => {
            this.fillPricesAndUnitsDataExceptionHandling(err, productId);
        });
    }

    /** ---------------- */

    private updateArticleDetailsXl(productId: number, pricesResponse: b2bProducts.GetArticleFromListXlResponse) {
        this.products[productId] = {
            ...this.updateArticleDetailsBase(this.products[productId], pricesResponse),
            thresholdPriceLists: pricesResponse.thresholdPriceLists,
        };
    }

    private updateArticleDetailsAltum(productId: number, pricesResponse: b2bProducts.GetArticleFromListAltumResponse) {
        this.products[productId] = {
            ...this.updateArticleDetailsBase(this.products[productId], pricesResponse),
            thresholdPriceLists: pricesResponse.thresholdPriceLists,
        };
    }

    private updateArticleDetailsBase(currentProduct: b2b.ProductListElement, pricesResponse: b2bProducts.GetArticleFromListBaseResponse): b2b.ProductListElement {
        return {
            ...this.updateProductDetailsBase(currentProduct, pricesResponse),
            itemExistsInCurrentPriceList: pricesResponse.itemExistsInCurrentPriceList,
            articleDetailsType: pricesResponse.articleDetailsType,
        };
    }

    private updateProductDetailsBase(currentProduct: b2b.ProductListElement, productPurchaseDetails: b2bProductDetails.ProductPurchaseDetailsBase) {
        const unitData: b2b.UnitMapElement = this.prepareUnitBaseData(productPurchaseDetails);
        currentProduct.units.set(unitData.unitId, unitData);

        return {
            ...currentProduct,
            ...unitData,
        };
    }

    private prepareUnitBaseData(productPurchaseDetails: b2bProductDetails.ProductPurchaseDetailsBase): b2b.UnitMapElement {
        const { price, unit } = productPurchaseDetails;
        const stockLevel = productPurchaseDetails.stockLevel.representsExistingValue ? productPurchaseDetails.stockLevel.value : '0';

        let netPrice: number;
        let grossPrice: number;
        let baseNetPrice: number;
        let baseGrossPrice: number;
        let unitNetPrice: number;
        let unitGrossPrice: number;
        let showUnitNetPrice = false;
        let showUnitGrossPrice = false;

        let converter: string;
        let currentUnit: string = unit.basicUnit;
        let denominator: number;
        let numerator: number;

        if (this.configService.config.priceMode !== PriceMode.subtotal) {
            grossPrice = price?.grossPrice;
            baseGrossPrice = price?.baseGrossPrice;
            showUnitGrossPrice = price?.unitGrossPrice.representsExistingValue;
            unitGrossPrice = showUnitGrossPrice ? price?.unitGrossPrice.value : null;
        }

        if (this.configService.config.priceMode !== PriceMode.total) {
            netPrice = price?.netPrice;
            baseNetPrice = price?.baseNetPrice;
            showUnitNetPrice = price?.unitNetPrice?.representsExistingValue;
            unitNetPrice = showUnitNetPrice ? price?.unitNetPrice?.value : null;
        }

        //TODO - poprawić na backendzie i sprawdzać flagę "denominator.representsExistingValue", ghdy bedzie ona już uwzgledniała jednostkę pomocniczą
        if (unit.auxiliaryUnit.representsExistingValue) {
            currentUnit = unit.auxiliaryUnit.unit;
            denominator = unit.denominator.value;
            numerator = unit.numerator.value;
            converter = ConvertingUtils.unitConverterString(unit.denominator.value, currentUnit, unit.numerator.value, unit.basicUnit);
        }

        return {
            grossPrice,
            netPrice,
            baseGrossPrice,
            baseNetPrice,
            currency: price?.currency,
            stockLevel,
            stockLevelNumber: ConvertingUtils.stringToNum(stockLevel),
            denominator,
            numerator,
            isUnitTotal: <0 | 1>(unit.isUnitTotal ? 1 : 0),
            basicUnit: unit.basicUnit,
            unitNetPrice,
            unitGrossPrice,
            showUnitNetPrice,
            showUnitGrossPrice,
            converter,
            unitLockChange: unit.unitLockChange,
            unitId: unit.defaultUnitNo,
            defaultUnitNo: unit.defaultUnitNo,
            unit: currentUnit,
            areUnitDataFilled: true,
        };
    }

    private fillPricesAndUnitsDataExceptionHandling(err: HttpErrorResponse, productId: number): void {
        this.unitsLoaded = true;
        this.products[productId].pricesLoaded = true;
    }

    fillUnitsForList(productId: number, unitList: b2bProducts.articleUnitList) {
        if (!this.products[productId].units) {
            this.products[productId].units = new Map<number, b2b.UnitMapElement>();
        }

        unitList.units.forEach(item => {

            if (!this.products[productId].units.has(item.unitId)) {
                this.products[productId].units.set(item.unitId, {
                    unit: item.unitName,
                    areUnitDataFilled: false,
                });
            }
        });

        this.products[productId].unitsLoaded = true;
    }

    changeQuantity(productId, quantity) {
        this.products[productId].quantity = quantity;
        this.products[productId].quantityChanged = true;
    }

    changeView(type: DisplayType) {
        this.config.displayType = type;
        localStorage.setItem('displayType', type + '');

        Object.values(this.products).forEach(product => {
            product.min = (this.config.displayType === DisplayType.quickShopping) ? 0 : -1;

            if (!product.quantityChanged) {
                product.quantity = (this.config.displayType === DisplayType.quickShopping) ? 0 : 1;
            }
        });
    }

    getSuggestions(searchValue: string) {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getSuggestionsXl(searchValue);

            case ApplicationType.ForAltum:
                return this.getSuggestionsAltum(searchValue);

            default:
                console.error(`getSuggestions(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private getSuggestionsXl(searchValue: string) {
        const request = this.prepareGetSuggestionsBaseRequest(searchValue);
        this.productsRequestsService.getSuggestionsXlRequest(request).subscribe(res => {
            this.inCaseSuccessGetSuggestionsBase(res);
        });
    }

    private getSuggestionsAltum(searchValue: string) {
        const request = this.prepareGetSuggestionsBaseRequest(searchValue);
        this.productsRequestsService.getSuggestionsAltumRequest(request).subscribe(res => {
            this.inCaseSuccessGetSuggestionsBase(res);
        });
    }

    private prepareGetSuggestionsBaseRequest(searchValue: string): b2bProducts.GetSuggestionsBaseRequest {
        const groupId = location.href.includes(this.menuService.routePaths.items) ? this.groupId || 0 : 0;
        return {
            filter: searchValue,
            groupId
        };
    }

    private inCaseSuccessGetSuggestionsBase(response: b2bProducts.GetSuggestionsBaseResponse) {
        this._suggestions = response.suggestions;
        this.suggestionsChanged.next(this._suggestions.slice());
    }

    getArticleGroupFilters(groupId: number) {
        this.resetCachedArticleGroupFilters();
        switch (this.configService.applicationId) {

            case ApplicationType.ForXL:
                return this.getArticleGroupFiltersXl(groupId);
            case ApplicationType.ForAltum:
                return this.getArticleGroupFiltersAltum(groupId);
            default:
                console.error(`getArticleGroupFilters(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }


    private getArticleGroupFiltersXl(groupId: number) {
        const request = this.prepareGetArticleGroupFiltersBaseRequest(groupId);
        this.productsRequestsService.getArticleGroupFiltersXlRequest(request).subscribe(res => {
            this.inCaseSuccessGetArticleGroupFiltersBase(res);
        });
    }

    private getArticleGroupFiltersAltum(groupId: number) {
        const request = this.prepareGetArticleGroupFiltersBaseRequest(groupId);
        this.productsRequestsService.getArticleGroupFiltersAltumRequest(request).subscribe(res => {
            this.inCaseSuccessGetArticleGroupFiltersBase(res);
        });
    }

    private prepareGetArticleGroupFiltersBaseRequest(groupId: number): b2bProducts.GetArticleGroupFiltersBaseRequest {
        return { groupId };
    }

    private inCaseSuccessGetArticleGroupFiltersBase(response: b2bProducts.GetArticleGroupFiltersBaseResponse) {
        this._filtersPerArticleGroupChanged.next(response.filtersPerArticleGroup);
    }

    initCurrentFiltersSummary(): b2bProducts.CurrentSelectedFiltersValuesSummary {
        this.updateCurrentSortMode(this.getDefaultSortMode())
        this.updateCurrentFiltersValues(null, null);
        return this.currentFiltersSummary;
    }

    restoreSavedSortMode(): ProductSortMode {
        const savedSortMode = this.getDefaultSortMode();
        this.updateCurrentSortMode(savedSortMode);
        return savedSortMode;
    }

    updateCurrentSortMode(sortMode: ProductSortMode) {
        this._currentFiltersSummary = {
            ...this._currentFiltersSummary,
            sortMode
        };
    }

    private getDefaultSortMode(): ProductSortMode {
        const localStorageSortMode = localStorage.getItem('sortMode');
        return localStorageSortMode ? ProductSortMode[localStorageSortMode] : ProductSortMode.NameAsc;
    }

    updateCurrentFiltersValues(globalFiltersValues: b2bProductsFilters.GlobalFilter[], articleGroupFiltersValues: b2bProductsFilters.ArticleGroupFilter[]) {
        const globalFilters = this.prepareCurrentGlobalFiltersValuesSummary(globalFiltersValues);
        const articleGroupFilters = this.prepareCurrentArticleGroupFiltersValuesSummary(articleGroupFiltersValues);

        this._currentFiltersSummary = {
            ...this._currentFiltersSummary,
            globalFilters,
            articleGroupFilters
        };

        this.warehousesService.updateLastSelectedWarehouseId(globalFilters.warehouseId);
    }

    private prepareCurrentGlobalFiltersValuesSummary(globalFiltersValues: b2bProductsFilters.GlobalFilter[]): b2bProducts.CurrentSelectedGlobalFiltersValuesSummary {
        const warehouseFilterValue = this.prepareGlobalFilterRequestValue<b2bProductsFilters.GlobalFilterValue>(GlobalFilterType.Warehouse, globalFiltersValues);
        const stockLevelFilterValue = this.prepareGlobalFilterRequestValue<b2bProductsFilters.GlobalFilterValue>(GlobalFilterType.StockLevel, globalFiltersValues);
        const othersFilterValue = this.prepareGlobalFilterRequestValue<b2bProductsFilters.GlobalFilterValue[]>(GlobalFilterType.Others, globalFiltersValues);

        const onlyAvailableValue = othersFilterValue?.find(value => value.id === GlobalOthersFilterType.OnlyAvailable);

        return {
            warehouseId: warehouseFilterValue ? warehouseFilterValue.id : this.configService.config.warehouseId,
            stockLevelFilter: stockLevelFilterValue ? stockLevelFilterValue.id : StockLevelFilterType.All,
            onlyAvailable: onlyAvailableValue ? true : false
        };
    }

    private prepareCurrentArticleGroupFiltersValuesSummary(articleGroupFiltersValues: b2bProductsFilters.ArticleGroupFilter[]): b2bProducts.FiltersRequestObject[] {
        return articleGroupFiltersValues
            ?.map(filterValue => this.prepareArticleFilterRequestObject(filterValue))
            ?.filter(filterValue => filterValue);
    }

    private prepareArticleFilterRequestObject(articleGroupFiltersValues: b2bProductsFilters.ArticleGroupFilter): b2bProducts.FiltersRequestObject {
        const selectedValues = articleGroupFiltersValues.selectedValue as b2bProductsFilters.ArticleGroupFilterValue[];

        if (selectedValues?.length > 0) {
            return {
                filterId: articleGroupFiltersValues.filterId,
                values: <string[]>selectedValues.map(selectedValue => selectedValue.translatedName), //TODO temp solution - should be number id instead of string value
            };
        }

        return null;
    }

    private prepareGlobalFilterRequestValue<T>(globalFilterType: GlobalFilterType, globalFiltersValues: b2bProductsFilters.GlobalFilter[]): T {
        const filterValue = globalFiltersValues?.find(value => value.filterType === globalFilterType);
        return filterValue ? <T>filterValue.selectedValue : null;
    }

    haveAnySelectedArticleGroupFiltersValues() {
        return this._currentFiltersSummary?.articleGroupFilters?.length > 0;
    }

    clearCurrentFiltersSummary() {
        this._currentFiltersSummary = null;
    }

    private prepareGlobalFiltersSelectedValues(globalFilters: b2bProductsFilters.GlobalFilter[]) {
        if (!this._currentFiltersSummary?.globalFilters || !globalFilters || globalFilters.length === 0) {
            return globalFilters;
        }

        return globalFilters.map(globalFilter => {
            return {
                ...globalFilter,
                selectedValue: this.prepareGlobalFiltersSelectedValue(globalFilter, this._currentFiltersSummary.globalFilters)
            };
        });
    }

    private prepareGlobalFiltersSelectedValue(globalFilter: b2bProductsFilters.GlobalFilter, currentSelectedGlobalFilters: b2bProducts.CurrentSelectedGlobalFiltersValuesSummary) {
        switch (globalFilter.filterType) {
            case GlobalFilterType.Warehouse:
                return globalFilter.values?.find(value => value.id === currentSelectedGlobalFilters?.warehouseId);

            case GlobalFilterType.StockLevel:
                return globalFilter.values?.find(value => value.id === Number(currentSelectedGlobalFilters?.stockLevelFilter));

            case GlobalFilterType.Others:
                if (currentSelectedGlobalFilters?.onlyAvailable) {
                    const selectedValue = globalFilter.values?.find(value => value.id === Number(GlobalOthersFilterType.OnlyAvailable));
                    return selectedValue ? [selectedValue] : null;
                } else {
                    return null;
                }

            default:
                return null;
        }
    }

    resetArticleGroupFilters() {
        this.getArticleGroupFilters(this.groupId);
    }

    resetCachedArticleGroupFilters() {
        this._currentFiltersSummary = {
            ...this._currentFiltersSummary,
            articleGroupFilters: null
        };
    }


    getFilterSets(groupId: number, updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType = UpdateFilterSetsExtraActionType.ResetActiveFilterSet) {
        this.productsFiltersSetsService.getFilterSets(groupId, updateFilterSetsExtraActionType).subscribe(resp => {
            this.inCasePerformFilterSetAction(resp);
        });
    }

    deleteFilterSet(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier, updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType) {
        this.productsFiltersSetsService.deleteFilterSet(filterSetIdentifier).subscribe(this.inCaseDeleteFilterSet.bind(this, updateFilterSetsExtraActionType));
    }

    private async inCaseDeleteFilterSet(updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType, summary: b2bProductsFilters.PerformFilterSetActionSummary) {
        await this.clearFilterSetCache();
        this.inCasePerformFilterSetAction(summary);

        if (summary?.actionStatus?.filterSetModalStatus === FilterSetModalStatus.DeletedSuccessfully) {
            this.getFilterSets(this.groupId, updateFilterSetsExtraActionType);
        }
    }

    addFilterSet(groupId: number, saveFilterRequestModel: b2bProductsFilters.SaveFiltersRequestModel) {
        this.productsFiltersSetsService.addFilterSet(groupId, saveFilterRequestModel).subscribe(async resp => {
            await this.clearFilterSetCache();
            this.inCasePerformFilterSetAction(resp);
        });
    }

    updateFilterSetName(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        this.productsFiltersSetsService.updateFilterSetName(newFilterSetIdentifier).subscribe(async resp => {
            await this.clearFilterSetCache();
            this.inCasePerformFilterSetAction(resp);
        });
    }

    private inCasePerformFilterSetAction(summary: b2bProductsFilters.PerformFilterSetActionSummary) {
        if (summary?.actionStatus) {
            this._filterSetActionPerformed.next(summary?.actionStatus);
        }

        if (summary?.filterSetsSummary) {
            this._filterSetsChanged.next(summary?.filterSetsSummary);
        }
    }

    private async clearFilterSetCache() {
        await this.cacheService.clearCache(Config.filterSetClearCacheRequestName);
    }
}
