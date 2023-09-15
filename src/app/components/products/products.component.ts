import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ResourcesService } from '../../model/resources.service';
import { b2b } from '../../../b2b';
import { DisplayType } from '../../model/enums/display-type.enum';
import { CartsService } from '../../model/carts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../model/config.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MenuService } from 'src/app/model/menu.service';
import { CommonModalService } from 'src/app/model/shared/common-modal.service';
import { Config } from '../../helpers/config';
import { map, withLatestFrom } from 'rxjs/operators';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { ProductsFiltersService } from './services/products-filters.service';
import { CommonService } from '../../model/shared/common/common.service';
import { FilterSetModalStatus } from 'src/app/model/product/enums/filter-set-modal-status.enum';
import { UpdateFilterSetsExtraActionType } from 'src/app/model/product/enums/update-filter-sets-extra-action-type.enum';
import { AccountService } from 'src/app/model/account.service';
import { ProductSortMode } from 'src/app/model/product/enums/products-sort-mode.enum';
import { ProductsSortingService } from './services/products-sorting.service';
import { ProductSortingAccuracyVisibility } from 'src/app/model/product/enums/product-sorting-accuracy-visibility.enum';
import { ProductsService } from 'src/app/model/products/products.service';
import { GroupsService } from 'src/app/model/groups/groups.service';
import { UnsubscribeComponent } from '../common/unsubscribe.component';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    host: { 'class': 'app-products view-with-sidebar' },
    styleUrls: ['./products.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent extends UnsubscribeComponent implements OnInit {

    groupsOpened: boolean;

    r: ResourcesService;

    groupId: number;
    forbiddenGroup: boolean; //forbidden or not exist
    forbiddenGroupRedirect: b2b.TreeParameters;
    currentTreeParameters: b2b.TreeParameters;

    productsList: ProductsService;
    breadcrumbs: b2b.Group[];
    groups: GroupsService;

    message: string;

    showUnacceptableDiscounts: boolean;
    haveAnyFilters: boolean;
    haveAnySelectedFiltersValuesToShow: boolean;

    confirmDeleteFilterSetModalData: b2bProductsFilters.ConfirmDeleteFilterSetModalData;
    filterSetSuccessNotificationModalData: b2bProductsFilters.FilterSetNotificationModalData;
    filterSetErrorNotificationModalData: b2bProductsFilters.FilterSetNotificationModalData;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public menuService: MenuService,
        public configService: ConfigService,
        resourcesService: ResourcesService,
        private cartsService: CartsService,
        groupsService: GroupsService,
        productsService: ProductsService,
        public changeDetector: ChangeDetectorRef,
        private commonModalService: CommonModalService,
        private productsFiltersService: ProductsFiltersService,
        private commonService: CommonService,
        private accountService: AccountService,
        private productsSortingService: ProductsSortingService

    ) {
        super();
        this.r = resourcesService;
        this.groups = groupsService;
        this.productsList = productsService;
        this.productsList.config.displayType = 1;

        this.groupsOpened = false;

        this.forbiddenGroupRedirect = {
            groupId: 0,
            parentId: null
        };

        this.confirmDeleteFilterSetModalData = {
            isOpened: false,
            autoClose: false,
        };

        this.filterSetSuccessNotificationModalData = {
            isOpened: false,
            autoCloseTimeout: Config.autoCloseFilterSetModalTimeout,
            autoClose: true,
        };

        this.filterSetErrorNotificationModalData = {
            isOpened: false,
            autoClose: false,
        };
    }


    ngOnInit() {
        this.initCurrentFiltersSummaryIfRequired();
        this.watchChanges();

        this.commonService.getGlobalFilters();
    }

    private watchChanges(): void {
        this.registerSub(this.activatedRoute.params
            .pipe(
                withLatestFrom(this.activatedRoute.queryParams),
                map(results => ({ params: results[0], query: results[1] })))
            .subscribe(this.activeRouteValuesChanged.bind(this)));

        this.registerSub(this.groups.groupChanged$.subscribe(res => {
            if (res) {
                this.setBreadcrumbs(res.history);
                this.handleVisibility('groups', false);
                this.changeDetector.markForCheck();
            }
        }));

        this.registerSub(this.configService.searchEvent.subscribe((res) => {
            //reseting filters calls new list itself
            if (res.searchPhrase !== '') {
                this.productsList.resetArticleGroupFilters();
                this.updateToAccuracySorting();
                this.loadProducts(this.groupId);
            }
        }));

        this.registerSub(this.productsList.unitsChanged$.subscribe(() => {
            this.changeDetector.markForCheck();
        }));

        this.registerSub(this.productsList.filtersChanged$.subscribe((summary: b2bProductsFilters.FiltersSummary) => {
            this.changeFilters(summary.globalFilters, summary.articleGroupFilters);
            this.changeDetector.markForCheck();
        }));

        this.registerSub(this.productsList.filterSetsChanged$.subscribe((filterSetsSummary: b2bProductsFilters.FilterSetsSummary) => {
            this.productsFiltersService.changeFilterSets(filterSetsSummary);
            this.changeDetector.markForCheck();
        }));

        this.registerSub(this.productsList.filterSetActionPerformed$.subscribe((status: b2bProductsFilters.FilterSetActionStatus) => {
            this.configService.loaderSubj.next(false);
            this.showFilterSetNotificationModalIfPossible(status.filterSetIdentifier, status.filterSetModalStatus);
            this.changeDetector.markForCheck();
        }));
        this.inCaseUserLogOut();
    }

    private activeRouteValuesChanged(results: any) {
        this.groupId = Number(results.params.id);

        if (this.menuService.lastTwoRoutes) {
            if (!this.menuService.lastTwoRoutes[0].url.includes(this.menuService.routePaths.itemDetails)) {
                this.productsList.pagination.goToStart();
            }
            this.showUnacceptableDiscounts = this.menuService.lastTwoRoutes[0].url === this.menuService.routePaths.promotions;
        }

        this.currentTreeParameters = {
            groupId: this.groupId,
            parentId: results.query.parent || null,
        };

        if (this.groupId === 0 && !this.productsList.searchPhrase) {
            this.router.navigate([this.menuService.routePaths.home]);
            this.groupId = NaN;

            this.currentTreeParameters = {
                groupId: NaN,
                parentId: this.currentTreeParameters.parentId
            };

            return;
        }

        if (Number.isNaN(this.groupId)) {
            this.router.navigate([this.menuService.routePaths.home]);
            return;
        }

        this.updateSearchingAndSorting();

        this.loadProducts(this.groupId);
        this.getArticleGroupFilters();
    }

    private getArticleGroupFilters() {
        this.productsList.getArticleGroupFilters(this.groupId);
        this.productsList.getFilterSets(this.groupId);
    }


    private updateSearchingAndSorting() {
        if (this.groupId === 0) {
            this.productsList.pagination.goToStart();
            this.updateToAccuracySorting();
            return;
        }

        if (this.productsList.searchPhrase !== '') {
            this.resetSearchValue();
        }
        this.restoreSavedSortMode();
    }

    private inCaseUserLogOut() {
        this.registerSub(this.accountService.logOutSubj.subscribe(() => {
            this.commonService.clearGlobalFilters();
        }));
    }

    initCurrentFiltersSummaryIfRequired() {
        if (!this.productsList.currentFiltersSummary) {
            const summary = this.productsList.initCurrentFiltersSummary();
            this.productsSortingService.updateSorting(summary.sortMode);
        }
    }

    loadProducts(groupId: number): void {
        this.initBeforeGetArticleList();

        this.productsList.getArticleList(groupId)
            .then(this.inCaseSuccessGetArticleList.bind(this))
            .catch(this.inCaseErrorGetArticleList.bind(this));
    }

    getArticleListWithGroupFilters() {
        this.initBeforeGetArticleList();

        this.productsList.getArticleListWithFilters()
            .then(this.inCaseSuccessGetArticleList.bind(this))
            .catch(this.inCaseErrorGetArticleList.bind(this));
    }

    private initBeforeGetArticleList() {
        this.productsList.products = undefined;
        this.changeDetector.markForCheck();

        this.configService.loaderSubj.next(true);
        this.message = null;
    }

    private inCaseSuccessGetArticleList() {
        if (this.productsList.config.displayType === DisplayType.grid && this.configService.isMobile) {
            this.productsList.config.displayType = DisplayType.list;
        }

        this.changeDetector.markForCheck();
        this.loadUnitsForArticlesIfPossible();
    }

    private loadUnitsForArticlesIfPossible() {
        if (this.productsList.productsLength > 0) {
            const ids = [];

            Object.values(this.productsList.products).forEach(product => {
                if (!product.unitLockChange) {
                    ids.push(product.id);
                }
            });

            window.setTimeout(() => {
                //put to end of event loop, so that the dom elements and bindings are ready for a response
                this.productsList.loadUnitsForMany(ids).subscribe(() => {
                    this.changeDetector.markForCheck();
                    this.configService.loaderSubj.next(false);
                });
            }, 0);
        }
    }

    private inCaseErrorGetArticleList(err: HttpErrorResponse) {
        if (err.status === 403) {
            this.forbiddenGroup = true;
            this.productsList.products = undefined;
            this.message = this.r.translations.forbiddenGroup;
            this.configService.loaderSubj.next(false);
            this.changeDetector.markForCheck();
            return Promise.resolve(err);
        }

        if (err.status === 404) {
            this.message = this.r.translations ? this.r.translations.resultsNotFound : '';
            this.configService.loaderSubj.next(false);
            this.changeDetector.markForCheck();
            return Promise.resolve(err);
        }

        if (!this.configService.isOnline && this.groupId !== this.productsList.groupId) {
            //offline and old data (from previously selected group)

            this.groupId = this.productsList.groupId;
            this.currentTreeParameters = {
                groupId: this.productsList.groupId,
                parentId: this.currentTreeParameters.parentId
            };

            this.productsList.products = undefined;
        }

        if (this.productsList.products && this.productsList.productsLength === 0) {
            this.message = this.r.translations ? this.r.translations.resultsNotFound : '';
        }

        if (!this.configService.isOnline && this.productsList.products === undefined) {
            this.message = this.r.translations ? this.r.translations.noDataInOfflineMode : '';
        }

        this.configService.loaderSubj.next(false);
        this.changeDetector.markForCheck();
        return Promise.resolve(err);
    }

    getArticleFromList(productId: number) {
        window.setTimeout(() => {
            //put to end of event loop, so that the dom elements and bindings are ready for a response

            if (this.productsList.products[productId].netPrice === undefined
                && this.productsList.products[productId].grossPrice === undefined) {

                this.productsList.getArticleFromList(productId).then(() => {

                    if (this.productsList.products[productId]) {
                        this.productsList.products[productId].pricesLoaded = true;
                        this.changeDetector.markForCheck();
                    }

                }).catch((err: HttpErrorResponse) => {

                    if (!this.configService.isOnline) {

                        if (!this.productsList.products[productId].grossPrice || !this.productsList.products[productId].netPrice) {
                            this.message = this.r.translations ? this.r.translations.missingSomeDataInOfflineMode : '';
                        }

                        if (!this.productsList.products[productId].grossPrice) {
                            this.productsList.products[productId].grossPrice = this.r.translations ? this.r.translations.noData : '';
                        }

                        if (!this.productsList.products[productId].netPrice) {
                            this.productsList.products[productId].netPrice = this.r.translations ? this.r.translations.noData : '';
                        }

                        if (!this.productsList.products[productId].currency) {
                            this.productsList.products[productId].currency = '';
                        }

                    }

                    if (this.productsList.products[productId]) {
                        this.productsList.products[productId].pricesLoaded = true;
                    }

                    this.changeDetector.markForCheck();

                    return Promise.reject(err);
                });

            } else {
                this.productsList.products[productId].pricesLoaded = true;
            }
        }, 0);
    }

    changePage(currentPage) {
        this.productsList.pagination.changePage(currentPage);
        this.getArticleList();
    }

    private prepareRequestToAddToCart(item: b2b.ProductListElement): b2b.AddToCartRequest {
        return {
            cartId: item.cartId,
            warehouseId: this.productsList.currentFiltersSummary.globalFilters.warehouseId,
            createNewCart: item.cartId === Config.createNewCartId,
            items: [{
                articleId: item.id,
                quantity: item.quantity,
                unitDefault: item.unitId
            }]
        };
    }

    addToCart(item: b2b.ProductListElement) {
        if (!item.cartId) {
            this.commonModalService.showNoAvailableCartsModalMessage();
            return;
        }

        if (!item.quantity || item.quantity === 0) {
            return;
        }
        this.configService.loaderSubj.next(true);
        const request = this.prepareRequestToAddToCart(item);

        this.cartsService.addToCart(request).then(() => {
            item.quantity = 1;
            this.changeDetector.markForCheck();
            this.configService.loaderSubj.next(false);
        }).catch(() => {
            this.configService.loaderSubj.next(false);
        });
    }

    trackByFn(index, itemKeyValuePair) {
        return itemKeyValuePair.value.id || index;
    }

    addManyToCart(cartId: number) {
        if (!cartId) {
            this.commonModalService.showNoAvailableCartsModalMessage();
            return;
        }

        const products = Object.values(this.productsList.products).filter(product => {
            return product.quantity > 0;
        });

        if (products.length === 0) {
            return;
        }

        this.configService.loaderSubj.next(true);
        const requestArray: b2b.AddToCartRequest = {
            cartId: cartId,
            warehouseId: this.productsList.currentFiltersSummary.globalFilters.warehouseId,
            createNewCart: cartId === Config.createNewCartId,
            items: products.map(item => {
                return <b2b.AddToCartRequestItem>{
                    articleId: item.id,
                    quantity: item.quantity,
                    unitDefault: item.unitId
                };
            })
        };


        this.cartsService.addToCart(requestArray).then(() => {

            Object.values(this.productsList.products).forEach(item => {
                if (item.quantityChanged) {
                    item.quantity = 0;
                    item.quantityChanged = false;
                }
            });

            this.changeDetector.markForCheck();
            this.configService.loaderSubj.next(false);
        }).catch(() => {
            this.configService.loaderSubj.next(false);
        });
    }

    setBreadcrumbs(breadcrumbs: b2b.Group[]) {
        this.breadcrumbs = breadcrumbs;
    }

    handleVisibility(section: any, visibility?: boolean) {
        switch (section) {
            case 'groups':
                this.groupsOpened = (visibility === undefined ? !this.groupsOpened : visibility);
                break;
        }
    }

    unitConverter(productId) {
        this.productsList.convertUnits(productId, this.productsList.products[productId].unitId);
    }

    sortArticleList(itemKeyValuePair, nextItemKeyValuePair) {
        if (itemKeyValuePair.value.rowNumber < nextItemKeyValuePair.value.rowNumber) {
            return -1;
        }
        return 1;
    }

    openFiltersDialog() {
        this.productsFiltersService.openFiltersDialog();
    }

    private changeFilters(globalFilters: b2bProductsFilters.GlobalFilter[], articleGroupFilters: b2bProductsFilters.ArticleGroupFilter[]) {
        this.haveAnyFilters = this.checkIfHaveAnyFilters(globalFilters, articleGroupFilters);
        const filtersSummary = this.prepareFiltersSummary(globalFilters, articleGroupFilters);
        this.productsFiltersService.changeFilters(filtersSummary);
    }

    private checkIfHaveAnyFilters(globalFilters: b2bProductsFilters.GlobalFilter[], articleGroupFilters: b2bProductsFilters.ArticleGroupFilter[]) {
        return (globalFilters && globalFilters.length > 0) || (articleGroupFilters && articleGroupFilters.length > 0);
    }

    private prepareFiltersSummary(globalFilters: b2bProductsFilters.GlobalFilter[], articleGroupFilters: b2bProductsFilters.ArticleGroupFilter[]): b2bProductsFilters.FiltersSummary {
        return { globalFilters, articleGroupFilters };
    }

    onFiltersValuesChanged(selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        this.productsList.updateCurrentFiltersValues(selectedFiltersSummary.globalFiltersValues, selectedFiltersSummary.articleGroupFiltersValues);

        if (this.haveAnySelectedArticleGroupFiltersValues(selectedFiltersSummary)) {
            this.resetSearchAndSortingIfRequired();
            this.productsList.pagination.goToStart();
            this.getArticleListWithGroupFilters();
        } else {
            this.productsList.pagination.goToStart();
            this.loadProducts(this.groupId);
        }

        this.haveAnySelectedFiltersValuesToShow = selectedFiltersSummary.haveAnySelectedFiltersValuesToShow;
    }

    private haveAnySelectedArticleGroupFiltersValues(summary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        return summary.haveAnySelectedFiltersValues && summary.articleGroupFiltersValues && summary.articleGroupFiltersValues.length > 0;
    }

    onAllFiltersValuesCleared(filtersSummary: b2bProductsFilters.FiltersSummary) {
        this.productsList.updateCurrentFiltersValues(filtersSummary?.globalFilters, filtersSummary?.articleGroupFilters);

        this.resetSearchAndSortingIfRequired();

        this.redirectAfterResetFilters();
        this.haveAnySelectedFiltersValuesToShow = null;
    }

    resetSearchFilter() {
        this.resetSearchAndSortingIfRequired();
        this.redirectAfterResetFilters();
    }

    private redirectAfterResetFilters() {
        this.productsList.pagination.goToStart();
        if (this.groupId === 0) {
            this.router.navigate([this.menuService.routePaths.home]);
            return;
        } else {
            this.loadProducts(this.groupId);
        }
    }

    private resetSearchAndSortingIfRequired() {
        if (this.productsList.searchPhrase !== '') {
            this.resetSearchValue();
            this.restoreSavedSortMode();
        }
    }

    private restoreSavedSortMode() {
        const restoredSortMode = this.productsList.restoreSavedSortMode();
        this.productsSortingService.updateSorting(restoredSortMode, ProductSortingAccuracyVisibility.Hidden);
    }

    private updateToAccuracySorting() {
        this.productsSortingService.updateSorting(ProductSortMode.Accuracy, ProductSortingAccuracyVisibility.Visible);
        this.productsList.updateCurrentSortMode(ProductSortMode.Accuracy);
    }


    private resetSearchValue() {
        this.productsList.searchPhrase = '';
        this.configService.searchEvent.next({ searchPhrase: this.productsList.searchPhrase });
    }

    onClickDeleteFilterSet(requestModel: b2bProductsFilters.DeleteFilterSetRequestModel) {
        this.showConfirmDeleteFilterSetModal(requestModel);
    }

    showConfirmDeleteFilterSetModal(requestModel: b2bProductsFilters.DeleteFilterSetRequestModel) {
        this.confirmDeleteFilterSetModalData = {
            ...this.confirmDeleteFilterSetModalData,
            isOpened: true,
            filterSetIdentifier: requestModel.filterSetIdentifier,
            updateFilterSetsExtraActionType: requestModel.updateFilterSetsExtraActionType,
        };
        this.changeDetector.markForCheck();
    }

    closeConfirmDeleteFilterSetModal() {
        this.confirmDeleteFilterSetModalData.isOpened = false;
        this.changeDetector.markForCheck();
    }

    deleteFilterSet(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier, updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType) {
        this.configService.loaderSubj.next(true);
        this.closeConfirmDeleteFilterSetModal();

        this.productsList.deleteFilterSet(filterSetIdentifier, updateFilterSetsExtraActionType);
    }

    showFilterSetNotificationModalIfPossible(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier, filterSetModalStatus: FilterSetModalStatus) {
        switch (filterSetModalStatus) {
            case FilterSetModalStatus.AddedSuccessfully:
            case FilterSetModalStatus.NameUpdatedSuccessfully:
                this.filterSetSuccessNotificationModalData = this.prepareFilterSetNotificationModalBase(this.filterSetSuccessNotificationModalData, filterSetIdentifier, filterSetModalStatus);
                break;
            case FilterSetModalStatus.AddingFailed:
            case FilterSetModalStatus.DeletionFailed:
            case FilterSetModalStatus.UpdatingNameFailed:
                this.filterSetErrorNotificationModalData = this.prepareFilterSetNotificationModalBase(this.filterSetErrorNotificationModalData, filterSetIdentifier, filterSetModalStatus);
                break;
            case FilterSetModalStatus.DeletedSuccessfully:
            default:
                break;
        }
    }

    private prepareFilterSetNotificationModalBase(notificationModalData: b2bProductsFilters.FilterSetNotificationModalData, filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier, filterSetModalStatus: FilterSetModalStatus) {
        return {
            ...notificationModalData,
            isOpened: true,
            filterSetIdentifier,
            filterSetModalStatus,
        };
    }

    closeFilterSetNotificationModal(filterSetModalStatus: FilterSetModalStatus) {
        switch (filterSetModalStatus) {
            case FilterSetModalStatus.AddedSuccessfully:
            case FilterSetModalStatus.NameUpdatedSuccessfully:
                this.filterSetSuccessNotificationModalData.isOpened = false;
                break;
            case FilterSetModalStatus.AddingFailed:
            case FilterSetModalStatus.DeletionFailed:
            case FilterSetModalStatus.UpdatingNameFailed:
                this.filterSetErrorNotificationModalData.isOpened = false;
                break;
        }

        this.changeDetector.markForCheck();
    }

    onSaveFilterSet(requestModel: b2bProductsFilters.SaveFiltersRequestModel) {
        this.configService.loaderSubj.next(true);
        this.productsList.addFilterSet(this.groupId, requestModel);
    }

    onChangeFilterSetName(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        this.configService.loaderSubj.next(true);
        this.productsList.updateFilterSetName(newFilterSetIdentifier);
    }

    onSortingModeChanged(sortMode: ProductSortMode) {
        this.productsList.updateCurrentSortMode(sortMode);
        this.productsList.pagination.goToStart();
        this.getArticleList();
    }

    getArticleList() {
        if (this.productsList.haveAnySelectedArticleGroupFiltersValues()) {
            this.getArticleListWithGroupFilters();
        } else {
            this.loadProducts(this.groupId);
        }
    }
}
