import { Injectable } from '@angular/core';
import { ProductBase } from './shared/product-base/product-base';
import { b2b } from '../../b2b';
import { b2bShared } from 'src/integration/b2b-shared';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ConvertingUtils } from '../helpers/converting-utils';
import { ConfigService } from './config.service';
import { WarehousesService } from './warehouses.service';
import { ProductStatus } from './enums/product-status.enum';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { ProductDetailsRequestsService } from './product/product-details-requests.service';
import { Subject, Observable, of, combineLatest, throwError } from 'rxjs';
import { ApplicationType } from './enums/application-type.enum';
import { Config } from '../helpers/config';
import { ImageType } from './shared/enums/image-type.enum';
import { catchError, map, tap } from 'rxjs/operators';
import { ProductDetailsType } from './product/enums/product-details-type.enum';
import { ERPService } from './shared/erp/erp.service';

@Injectable()
export class ProductDetailsService extends ProductBase {

    private _productsPurchaseDetailsSummaryCache: b2bProductDetails.ProductsPurchaseDetailsSummaryCache;

    private _productPurchaseDetailsSummaryChanged: Subject<b2bProductDetails.ProductPurchaseDetailsSummary>;
    productPurchaseDetailsSummaryChanged$: Observable<b2bProductDetails.ProductPurchaseDetailsSummary>;

    private _productAttributesSummaryChanged: Subject<b2bProductDetails.ProductAttributesSummary>;
    productAttributesSummaryChanged$: Observable<b2bProductDetails.ProductAttributesSummary>;

    private _productGeneralInfoChanged: Subject<b2bProductDetails.ProductGeneralInfoBoth>;
    productGeneralInfoChanged$: Observable<b2bProductDetails.ProductGeneralInfoBoth>;

    private _productVariantsChanged: Subject<b2bProductDetails.ProductVariantsSummary>;
    productVariantsChanged$: Observable<b2bProductDetails.ProductVariantsSummary>;

    replacements: b2b.ProductReplacement[];

    replacementsPromises: Promise<void>[];
    replacementsUnitsPromise: Promise<void>;

    private lastOrderDetails: b2bProductDetails.LastOrderDetails;
    private plannedDeliveries: b2bProductDetails.PlannedDelivery[];

    lastOrderDetails$: Subject<b2bProductDetails.LastOrderDetails>;
    plannedDeliveries$: Subject<b2bProductDetails.PlannedDelivery[]>;

    private thresholdPriceLists: b2bProductDetails.ThresholdPriceLists;
    thresholdPriceListsChanged: Subject<b2bProductDetails.ThresholdPriceLists>;

    constructor(httpClient: HttpClient,
        configService: ConfigService,
        warehousesService: WarehousesService,
        private productDetailsRequestsService: ProductDetailsRequestsService, erpService: ERPService) {
        super(httpClient, warehousesService, configService, erpService);

        this.thresholdPriceListsChanged = new Subject();

        this.lastOrderDetails$ = new Subject();
        this.plannedDeliveries$ = new Subject();

        this._productPurchaseDetailsSummaryChanged = new Subject();
        this.productPurchaseDetailsSummaryChanged$ = this._productPurchaseDetailsSummaryChanged.asObservable();

        this._productAttributesSummaryChanged = new Subject();
        this.productAttributesSummaryChanged$ = this._productAttributesSummaryChanged.asObservable();

        this._productGeneralInfoChanged = new Subject();
        this.productGeneralInfoChanged$ = this._productGeneralInfoChanged.asObservable();

        this._productVariantsChanged = new Subject();
        this.productVariantsChanged$ = this._productVariantsChanged.asObservable();
    }

    private calculateReplacementValues(replacement: b2b.ProductReplacementResponse): b2b.ProductReplacementFilled {
        const copy = this.calculateCommonValues(replacement);

        this.fillUnitFromReplacement(copy.unitId, copy);
        if (copy.unitsLoaded === undefined) {
            copy.unitsLoaded = !!copy.unitLockChange;
        }

        copy.image = this.prepareImageBase(copy.imageId, copy.imageUrl, copy.imageType);
        copy.imageWidth = Config.defaultArticleReplacementImageWidth;
        copy.imageHeight = Config.defaultArticleReplacementImageHeight;
        return copy;
    }

    private prepareImageBase(imageId: number, imageUrl: string, imageType: ImageType): b2bShared.ImageBase {
        return { imageId, imageUrl, imageType };
    }

    private calculateCommonValues(item: b2b.ProductDetailsInfoResponse | b2b.ProductReplacementResponse): b2b.ProductDetailsInfo & b2b.ProductReplacementFilled {

        const copy: b2b.ProductDetailsInfo & b2b.ProductReplacementFilled = Object.assign({}, <any>item);

        copy.quantity = 1;
        copy.stockLevelNumber = ConvertingUtils.stringToNum(copy.stockLevel);

        copy.unitId = item.defaultUnitNo;
        copy.converter = this.getConverter(copy, copy);
        copy.auxiliaryUnit = copy.converter ? copy.auxiliaryUnit : copy.basicUnit;

        if (this.configService.applicationId === 0) {
            copy.unitLockChange = !!item.unitLockChange;
            copy.basicUnitNo = 0;
        } else {
            copy.unitLockChange = item.unitChangeBlocked;
            delete item.unitChangeBlocked;

            //override availability for altum - always available
            copy.status = 1;
        }

        return copy;
    }

    private fillUnitFromReplacement(unitId, replacement: b2b.ProductReplacementFilled) {

        if (!replacement.units) {
            replacement.units = new Map<number, b2b.UnitMapElement>();
        }

        const unitData: Partial<b2b.FilledUnitMapElement> = this.prepareCommonDetailsToCache(replacement);
        replacement.units.set(unitId, unitData);
    }

    private prepareCommonDetailsToCache(item: b2b.ProductDetailsInfo | b2b.ProductReplacementFilled): b2bShared.ProductDetailsCacheBaseElement {

        return {
            isUnitTotal: item.isUnitTotal,
            auxiliaryUnit: item.auxiliaryUnit,
            type: item.type,
            denominator: item.denominator,
            numerator: item.numerator,
            stockLevel: item.stockLevel,
            netPrice: item.netPrice,
            grossPrice: item.grossPrice,
            basicUnit: item.basicUnit,
            unitPrecision: item.unitPrecision,
            currency: item.currency,
            baseNetPrice: item.baseNetPrice,
            baseGrossPrice: item.baseGrossPrice,
            unitNetPrice: item.unitNetPrice,
            unitGrossPrice: item.unitGrossPrice,

            stockLevelNumber: item.stockLevelNumber,
            converter: item.converter
        };
    }

    private getConverter(unitElement: b2b.UnitMapElement, item: b2b.ProductDetailsInfo | b2b.ProductReplacementFilled) {

        if (item.unitId !== item.basicUnitNo && unitElement.auxiliaryUnit && unitElement.denominator) {
            return ConvertingUtils.unitConverterString(unitElement.denominator, unitElement.auxiliaryUnit, unitElement.numerator, unitElement.basicUnit);
        }
        return '';
    }

    loadReplacement(index: number, warehouseId: number) {

        if (index > this.replacements.length || this.replacementsPromises[index]) {
            return;
        }

        this.replacementsPromises[index] = this.requestReplacement(this.replacements[index].substituteId, warehouseId).then(res => {

            this.replacements[index] = <any>this.calculateReplacementValues(Object.assign({}, this.replacements[index], <any>res.body));

        }).catch(err => {

            if (err.status === 403) {
                this.replacements[index].availability = ProductStatus.unavaliable;
                this.replacements[index].unitsLoaded = true;
                return Promise.reject(err);
            }
        });


        return this.replacementsPromises[index];
    }

    private requestReplacement(substituteId: number, warehouseId: number): Promise<HttpResponse<b2b.ProductReplacementResponse>> {
        const params = { warehouseId };
        return this.httpClient.get<b2b.ProductReplacementResponse[]>('/api/items/substitute/' + substituteId, { params: <any>params, observe: 'response' })
            .toPromise()
            .then(res => {

                const convertedReplacementPrices = {
                    netPrice: ConvertingUtils.stringToNum(res.body[0].netPrice),
                    grossPrice: ConvertingUtils.stringToNum(res.body[0].grossPrice),
                    baseNetPrice: ConvertingUtils.stringToNum(res.body[0].baseNetPrice),
                    baseGrossPrice: ConvertingUtils.stringToNum(res.body[0].baseGrossPrice),
                };

                const newBody = Object.assign(res.body[0], convertedReplacementPrices);

                return res.clone({
                    body: newBody
                });

            }).catch(err => {
                return Promise.resolve(err);
            });
    }

    loadVisibleReplacementsAndAllUnits(warehouseId: number): Promise<void[]> {

        const ids = this.replacements.map(repl => repl.id);

        this.loadUnitsForReplacements(ids).pipe(
            catchError((err) => {
                this.replacementsUnitsPromise = Promise.reject();
                return err;
            })
        ).subscribe((res) => {
            this.replacementsUnitsPromise = Promise.resolve();
            return res;
        });

        const promises = [];

        ids.slice(0, 2).forEach((id, i) => {

            if (!this.replacementsPromises[i]) {
                this.replacementsPromises[i] = <any>Promise.all([this.loadReplacement(i, warehouseId), this.replacementsUnitsPromise]);
                promises.push(this.replacementsPromises[i]);
            }
        });

        return promises.length > 0 ? Promise.all(promises) : Promise.resolve([]);
    }

    private loadUnitsForReplacements(ids: number[]) {
        return this.requestUnitsForManyAndGroupById(ids).pipe(
            tap(res => {

                for (const id in res) {

                    this.replacements.forEach((replacement, replacementIndex) => {
                        if (replacement.id === Number(id)) {
                            this.fillUnits(replacementIndex, res[id][0].units, this.replacements);
                        }
                    });
                }

                return res;
            })
        );
    }

    loadUnvisibleReplacements(indexes: number[], warehouseId: number): Promise<void[]> {

        indexes.forEach(i => {
            if (!this.replacementsPromises[i]) {
                this.replacementsPromises[i] = <any>Promise.all([this.loadReplacement(i, warehouseId), this.replacementsUnitsPromise]);
            }
        });

        return Promise.all(this.replacementsPromises);
    }

    changeReplacementUnit(unitId: number, index: number): Promise<void> {

        unitId = Number(unitId);

        this.replacements[index].unitId = unitId;
        const unitElement: b2b.UnitMapElement = this.replacements[index].units.get(unitId);

        if (unitElement && Number.isInteger(unitElement.type)) {

            this.replacements[index] = Object.assign(this.replacements[index], unitElement);
            return Promise.resolve();
        }

        this.replacements[index].unitsLoaded = false;

        const requestParams: b2b.UnitConvertRequest = {
            id: this.replacements[index].id,
            unitNo: unitId || this.replacements[index].unitId || 0,
            features: '',
            warehouseId: 0
        };

        return super.unitConverterRequest(requestParams).then(res => {
            const unitsRes = res.body;

            this.fillReplacementUnitFromResponse(requestParams.unitNo, unitsRes, <any>this.replacements[index]);
            this.replacements[index].unitsLoaded = true;
        });
    }

    private fillReplacementUnitFromResponse(unitId, unitRes: b2b.UnitData, replacement: b2b.ProductReplacementFilled) {
        const converter = this.getConverter(unitRes, replacement);

        const unitData: b2b.UnitMapElement = Object.assign(unitRes, {
            stockLevelNumber: ConvertingUtils.stringToNum(unitRes.stockLevel),
            converter: converter,
            auxiliaryUnit: converter ? unitRes.auxiliaryUnit : replacement.basicUnit,
        });

        replacement.units.set(unitId, unitData);
        replacement = Object.assign(replacement, unitData);
    }

    private getLastOrderDetails(articleId: number) {
        const request = <b2bProductDetails.GetLastOrderRequest>{ articleId: articleId };

        this.productDetailsRequestsService.getLastOrderRequest(request).then((res) => {
            if (!res.isLastOrderPresent) {
                return;
            }
            this.lastOrderDetails = <any>res.lastOrderDetails;
            if (this.lastOrderDetails.isOrderInBasicUnit) {
                this.lastOrderDetails.unit = this.lastOrderDetails.basicUnit;
            } else {
                this.lastOrderDetails.unit = this.lastOrderDetails.auxiliaryUnit;
                this.lastOrderDetails.converter = ConvertingUtils.unitConverterString(this.lastOrderDetails.quantity, this.lastOrderDetails.auxiliaryUnit, this.lastOrderDetails.quantityInBasicUnit, this.lastOrderDetails.basicUnit);
            }
            this.lastOrderDetails$.next(this.lastOrderDetails);
        });
    }

    private getPlannedDeliveries(articleId: number) {
        const request = <b2bProductDetails.GetPlannedDeliveriesRequest>{ articleId: articleId };
        this.productDetailsRequestsService.getPlannedDeliveriesRequest(request).then((res) => {
            if (!res.isPlannedDeliveriesListPresent) {
                return;
            }
            this.plannedDeliveries = res.plannedDeliveries;
            this.plannedDeliveries$.next(this.plannedDeliveries);
        });
    }

    private getThresholdPriceList(request: b2bProductDetails.GetThresholdPriceListRequestBoth): void {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.getThresholdPriceListXl(request as b2bProductDetails.GetThresholdPriceListXlRequest);
                break;

            case ApplicationType.ForAltum:
                this.getThresholdPriceListAltum(request as b2bProductDetails.GetThresholdPriceListAltumRequest);
                break;

            default:
                console.error(`getThresholdPriceList(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private getThresholdPriceListXl(request: b2bProductDetails.GetThresholdPriceListXlRequest): void {
        this.productDetailsRequestsService.getThresholdPriceListXlRequest(request).subscribe((res) => {
            this.thresholdPriceLists = res;
            this.thresholdPriceListsChanged.next(this.thresholdPriceLists);
        });
    }

    private getThresholdPriceListAltum(request: b2bProductDetails.GetThresholdPriceListAltumRequest): void {
        this.productDetailsRequestsService.getThresholdPriceListAltumRequest(request).subscribe((res) => {
            this.thresholdPriceLists = res;
            this.thresholdPriceListsChanged.next(this.thresholdPriceLists);
        });
    }


    getManyArticlePurchaseDetails(productIds: number[], warehouseId: number) {
        productIds.forEach(productId => {
            this.getArticlePurchaseDetails(productId, warehouseId).subscribe();
        });
    }


    getArticlePurchaseDetails(articleId: number, warehouseId: number): Observable<b2bProductDetails.ProductPurchaseDetailsBoth> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getArticlePurchaseDetailsXl(articleId, warehouseId);
            case ApplicationType.ForAltum:
                return this.getArticlePurchaseDetailsAltum(articleId, warehouseId);
            default:
                console.error(`getArticlePurchaseDetails(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }


    public getArticlePurchaseDetailsXl(articleId: number, warehouseId: number) {
        const request = this.prepareGetArticlePurchaseDetailsBaseRequest(articleId, warehouseId);
        return this.productDetailsRequestsService.getArticlePurchaseDetailsXlRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetArticlePurchaseDetailsBase(articleId, warehouseId, resp);
            }),
            catchError(error => {
                return this.inCaseErrorGetArticlePurchaseDetails(articleId, error);
            })
        );
    }

    private getArticlePurchaseDetailsAltum(articleId: number, warehouseId: number) {
        const request = this.prepareGetArticlePurchaseDetailsBaseRequest(articleId, warehouseId);
        return this.productDetailsRequestsService.getArticlePurchaseDetailsAltumRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetArticlePurchaseDetailsBase(articleId, warehouseId, resp);
            }),
            catchError(error => {
                return this.inCaseErrorGetArticlePurchaseDetails(articleId, error);
            })
        );
    }

    private inCaseErrorGetArticlePurchaseDetails(productId: number, error: HttpErrorResponse) {
        if (error?.status === 204) {
            this.updateErrorPurchaseDetailsSummary(productId);
            return throwError(error);
        }

        return throwError(error);
    }

    private inCaseSuccessGetArticlePurchaseDetailsBase(articleId: number, warehouseId: number, response: b2bProductDetails.GetArticlePurchaseDetailsResponseBoth): b2bProductDetails.ProductPurchaseDetailsBoth {
        const purchaseDetails = this.prepareArticlePurchaseDetails(response as b2bProductDetails.ProductPurchaseDetailsBoth);
        this.updateProductsPurchaseDetailsSummaryCache(articleId, warehouseId, response?.unit?.defaultUnitNo, purchaseDetails, response.unitsSummary);
        this.updateProductPurchaseDetailsSummary(articleId, warehouseId, response?.unit?.defaultUnitNo);
        return { ...purchaseDetails };
    }

    private prepareGetArticlePurchaseDetailsBaseRequest(articleId: number, warehouseId: number): b2bProductDetails.GetArticlePurchaseDetailsBaseRequest {
        return { articleId, warehouseId };
    }

    convertUnits(productId: number, warehouseId: number, unitId: number): void {
        this.updateProductPurchaseDetails(productId, warehouseId, unitId).subscribe();
    }

    changeWarehouse(productId: number, warehouseId: number, unitId: number) {
        this.updateProductPurchaseDetails(productId, warehouseId, unitId).subscribe();
    }

    private updateProductPurchaseDetails(productId: number, warehouseId: number, unitId: number) {
        const cachedPurchaseSummary = this.getProductPurchaseDetailsSummary(productId, warehouseId, unitId);

        if (cachedPurchaseSummary?.purchaseDetails) {
            this._productPurchaseDetailsSummaryChanged.next({ ...cachedPurchaseSummary });
            return of(null);
        } else {
            return this.convertUnitsRequest(productId, warehouseId, unitId);
        }
    }

    //TODO - temp sollution, finally `convertUnitsRequest` should be in one place, and shared by product list and details
    private convertUnitsRequest(productId: number, warehouseId: number, unitId: number) {
        const request = this.prepareConvertUnitsBaseRequest(productId, warehouseId, unitId);

        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.convertUnitsXlRequest(request);
            case ApplicationType.ForAltum:
                return this.convertUnitsAltumRequest(request);
            default:
                console.error(`convertUnitsRequest(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private prepareConvertUnitsBaseRequest(productId: number, warehouseId: number, unitId: number): b2bProductDetails.ConvertUnitsBaseRequest {
        return {
            id: productId,
            unitId,
            warehouseId,
        };
    }

    private convertUnitsXlRequest(request: b2bProductDetails.ConvertUnitsBaseRequest) {
        return this.productDetailsRequestsService.unitConverterXlRequest(request).pipe(
            map((resp) => {
                this.inCaseSuccessConvertUnits(request, resp);
            })
        );
    }

    private convertUnitsAltumRequest(request: b2bProductDetails.ConvertUnitsBaseRequest) {
        return this.productDetailsRequestsService.unitConverterAltumRequest(request).pipe(
            map((resp) => {
                this.inCaseSuccessConvertUnits(request, resp);
            })
        );
    }

    private inCaseSuccessConvertUnits(request: b2bProductDetails.ConvertUnitsBaseRequest, response: b2bProductDetails.ConvertUnitsResponseBoth) {
        const purchaseDetails = this.prepareArticlePurchaseDetails(response as b2bProductDetails.ProductPurchaseDetailsBoth);
        const { id: productId, warehouseId, unitId } = request;

        this.updateProductPurchaseDetailsCache(productId, warehouseId, unitId, purchaseDetails);
        this.updateProductPurchaseDetailsSummary(productId, warehouseId, unitId);
    }

    private prepareArticlePurchaseDetails(purchaseDetails: b2bProductDetails.ProductPurchaseDetailsBoth): b2bProductDetails.ProductPurchaseDetailsBoth {
        const { unit: { auxiliaryUnit, denominator, numerator, basicUnit } = {}, unit, price, stockLevel, weightAndVolume, extensions, objectExtensions } = purchaseDetails;

        let converter = null;
        let currentUnit = basicUnit;

        if (auxiliaryUnit?.representsExistingValue) {
            converter = ConvertingUtils.unitConverterString(denominator?.value, auxiliaryUnit.unit, numerator?.value, basicUnit);
            currentUnit = auxiliaryUnit.unit;
        }

        const newUnit = {
            ...unit,
            unitId: unit.defaultUnitNo,
            converter,
            currentUnit,
        } as b2bShared.ArticleUnits;

        return {
            unit: newUnit,
            price,
            stockLevel,
            stockLevelNumber: ConvertingUtils.stringToNum(stockLevel.value),
            weightAndVolume,
            extensions,
            objectExtensions
        };
    }

    private updateProductsPurchaseDetailsSummaryCache(articleId: number, warehouseId: number, unitId: number, purchaseDetails: b2bProductDetails.ProductPurchaseDetailsBoth, unitsPreview: b2bShared.ArticleUnitPreview[]) {
        if (!this._productsPurchaseDetailsSummaryCache) {
            this._productsPurchaseDetailsSummaryCache = {
                purchaseDetails: {},
                units: {},
            };
        }

        this.updateProductUnitsCache(articleId, unitsPreview);
        this.updateProductPurchaseDetailsCache(articleId, warehouseId, unitId, purchaseDetails);
    }

    private updateProductUnitsCache(productId: number, unitsPreview: b2bShared.ArticleUnitPreview[]) {
        if (!this._productsPurchaseDetailsSummaryCache.units) {
            this._productsPurchaseDetailsSummaryCache.units = {};
        }

        if (!this._productsPurchaseDetailsSummaryCache.units[productId]) {
            this._productsPurchaseDetailsSummaryCache.units[productId] = {};
        }

        unitsPreview?.forEach(unitPreview => {
            this._productsPurchaseDetailsSummaryCache.units[productId][unitPreview.unitId] = unitPreview.unitName;
        });
    }

    private updateProductPurchaseDetailsCache(productId: number, warehouseId: number, unitId: number, purchaseDetails: b2bProductDetails.ProductPurchaseDetailsBoth) {
        if (!this._productsPurchaseDetailsSummaryCache.purchaseDetails) {
            this._productsPurchaseDetailsSummaryCache.purchaseDetails = {};
        }

        if (!this._productsPurchaseDetailsSummaryCache.purchaseDetails[productId]) {
            this._productsPurchaseDetailsSummaryCache.purchaseDetails[productId] = {};
        }

        if (!this._productsPurchaseDetailsSummaryCache.purchaseDetails[productId][warehouseId]) {
            this._productsPurchaseDetailsSummaryCache.purchaseDetails[productId][warehouseId] = {};
        }

        this._productsPurchaseDetailsSummaryCache.purchaseDetails[productId][warehouseId][unitId] = purchaseDetails as b2bProductDetails.ProductPurchaseDetailsBothIntersection;
    }

    private updateProductPurchaseDetailsSummary(productId: number, warehouseId: number, unitId: number) {
        const summary = this.getProductPurchaseDetailsSummary(productId, warehouseId, unitId);
        this._productPurchaseDetailsSummaryChanged.next(summary);
    }

    private getProductPurchaseDetailsSummary(productId: number, warehouseId: number, unitId: number): b2bProductDetails.ProductPurchaseDetailsSummary {
        const purchaseDetails = this._productsPurchaseDetailsSummaryCache?.purchaseDetails?.[productId]?.[warehouseId]?.[unitId];
        const unitsSummary = this._productsPurchaseDetailsSummaryCache?.units?.[productId];
        const unitsLength = unitsSummary ? Object.keys(unitsSummary)?.length : 0;

        return { productId, purchaseDetails, unitsSummary, unitsLength, itemExistsInCurrentPriceList: true };
    }

    private updateErrorPurchaseDetailsSummary(productId: number) {
        const summary = { productId, purchaseDetails: null, unitsSummary: null, unitsLength: null, itemExistsInCurrentPriceList: false };
        this._productPurchaseDetailsSummaryChanged.next(summary);
    }

    getAttributes(articleId: number) {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getAttributesXl(articleId);
            case ApplicationType.ForAltum:
                return this.getAttributesAltum(articleId);
            default:
                console.error(`getAttributes(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private getAttributesXl(articleId: number) {
        const request = this.prepareGetAttributesBaseRequest(articleId);
        return this.productDetailsRequestsService.getAttributesXlRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetAttributes(resp);
            })
        );
    }

    private getAttributesAltum(articleId: number) {
        const request = this.prepareGetAttributesBaseRequest(articleId);
        return this.productDetailsRequestsService.getAttributesAltumRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetAttributes(resp);
            })
        );
    }

    private prepareGetAttributesBaseRequest(articleId: number): b2bProductDetails.GetAttributesBaseRequest {
        return { articleId };
    }

    private inCaseSuccessGetAttributes(response: b2bProductDetails.GetAttributesResponseBoth) {
        const articleImages = this.updateProductsImageSrc(response.articleImages);
        const summary = { ...response, articleImages } as b2bProductDetails.ProductAttributesSummary;

        this.updateProductAttributesSummary(summary);
    }

    private updateProductsImageSrc(images: b2bProductDetails.ProductImage[]) {
        return images?.map(image => {
            image.imageSrc = Config.getImageSrc(image, Config.defaultArticleDetailsImageWidth, Config.defaultArticleDetailsImageHeight);
            return image;
        });
    }

    private updateProductAttributesSummary(summary: b2bProductDetails.ProductAttributesSummary) {
        this._productAttributesSummaryChanged.next(summary);
    }

    getProductGeneralInfo(productId: number, groupId: number): Observable<b2bProductDetails.ProductGeneralInfoBoth> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getProductGeneralInfoXl(productId, groupId);
            case ApplicationType.ForAltum:
                return this.getProductGeneralInfoAltum(productId, groupId);
            default:
                console.error(`getProductGeneralInfo(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private getProductGeneralInfoXl(productId: number, groupId: number) {
        const request = this.prepareGetProductGeneralInfoBaseRequest(productId, groupId);
        return this.productDetailsRequestsService.getArticleGeneralInfoXlRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetProductGeneralInfo(resp);
            })
        );
    }

    private getProductGeneralInfoAltum(productId: number, groupId: number) {
        const request = this.prepareGetProductGeneralInfoBaseRequest(productId, groupId);
        return this.productDetailsRequestsService.getArticleGeneralInfoAltumRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetProductGeneralInfo(resp);
            })
        );
    }

    private prepareGetProductGeneralInfoBaseRequest(articleId: number, contextGroupId: number): b2bProductDetails.GetArticleGeneralInfoBaseRequest {
        return { articleId, contextGroupId };
    }

    private inCaseSuccessGetProductGeneralInfo(response: b2bProductDetails.GetArticleGeneralInfoResponseBoth): b2bProductDetails.ProductGeneralInfoBoth {
        this.replacements = this.prepareProductReplacements(response.substituteList);
        this.replacementsPromises = [];

        this.updateProductGeneralInfo(response.articleGeneralInfo);

        return response.articleGeneralInfo;
    }

    private updateProductGeneralInfo(generalInfo: b2bProductDetails.ProductGeneralInfoBoth) {
        this._productGeneralInfoChanged.next(generalInfo);
    }

    private prepareProductReplacements(substitutesPreview: b2bProductDetails.SubstitutePreview[]): b2b.ProductReplacement[] {
        return substitutesPreview?.map(substitute => {
            return { substituteId: substitute.substituteId, id: substitute.articleId };
        });
    }

    getProuductDetails(productId: number, groupId: number, warehouseId: number): Observable<ProductDetailsType> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getProuductDetailsXl(productId, groupId, warehouseId);
            case ApplicationType.ForAltum:
                return this.getProuductDetailsAltum(productId, groupId, warehouseId);
            default:
                console.error(`getProuductDetails(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private getProuductDetailsXl(productId: number, groupId: number, warehouseId: number) {
        const request = this.prepareGetProuductDetailsBaseRequest(productId, groupId);
        return this.productDetailsRequestsService.getArticleDetailsXlRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetProuductDetails(productId, groupId, warehouseId, resp);
            })
        );
    }

    private getProuductDetailsAltum(productId: number, groupId: number, warehouseId: number) {
        const request = this.prepareGetProuductDetailsBaseRequest(productId, groupId);
        return this.productDetailsRequestsService.getArticleDetailsAltumRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetProuductDetails(productId, groupId, warehouseId, resp);
            })
        );
    }

    private prepareGetProuductDetailsBaseRequest(articleId: number, contextGroupId: number): b2bProductDetails.GetArticleDetailsBaseRequest {
        return { articleId, contextGroupId };
    }

    private inCaseSuccessGetProuductDetails(productId: number, groupId: number, warehouseId: number, response: b2bProductDetails.GetArticleDetailsResponseBoth): ProductDetailsType {
        switch (response.articleDetailsType) {
            case ProductDetailsType.NotContainVariants:
                this.updateFullProductDetails(productId, groupId, warehouseId);
                break;
            case ProductDetailsType.ContainsVariants:
                this.getProuductVariantsDetails(productId, response.articleVariantProperties).subscribe();
                break;
        }

        return response.articleDetailsType;
    }

    getProuductVariantsDetails(productId: number, properties: b2bShared.PropertyValuePreviewModel[]): Observable<void> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getProuductVariantsDetailsXl(productId, properties);
            case ApplicationType.ForAltum:
                return this.getProuductVariantsDetailsAltum(productId, properties);
            default:
                console.error(`getProuductVariantsDetails(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private getProuductVariantsDetailsXl(productId: number, properties: b2bShared.PropertyValuePreviewModel[]) {
        const request = this.prepareGetProuductVariantsDetailsBaseRequest(productId, properties);
        return this.productDetailsRequestsService.getArticleVariantsDetailsXlRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetProuductVariantsDetails(resp);
            })
        );
    }

    private getProuductVariantsDetailsAltum(productId: number, properties: b2bShared.PropertyValuePreviewModel[]) {
        const request = this.prepareGetProuductVariantsDetailsBaseRequest(productId, properties);
        return this.productDetailsRequestsService.getArticleVariantsDetailsAltumRequest(request).pipe(
            map((resp) => {
                return this.inCaseSuccessGetProuductVariantsDetails(resp);
            })
        );
    }

    private prepareGetProuductVariantsDetailsBaseRequest(articleId: number, properties: b2bShared.PropertyValuePreviewModel[]): b2bProductDetails.GetArticleVariantsDetailsBaseRequest {
        return { articleId, properties };
    }

    private inCaseSuccessGetProuductVariantsDetails(response: b2bProductDetails.GetArticleVariantsDetailsResponseBoth): void {
        const summary = response as b2bProductDetails.ProductVariantsSummary;
        this._productVariantsChanged.next(summary);
    }

    private updateFullProductDetails(productId: number, groupId: number, warehouseId: number) {
        combineLatest([this.getProductGeneralInfo(productId, groupId), this.getArticlePurchaseDetails(productId, warehouseId)]).subscribe(results => {
            this.getAttributes(productId).subscribe();

            const generalInfo = results[0] as b2bProductDetails.ProductGeneralInfoBoth;
            const purchaseDetails = results[1] as b2bProductDetails.ProductPurchaseDetailsBothIntersection;
            const requestModel = this.prepareUpdateExtraPropertiesDetailsRequestModel(productId, warehouseId, purchaseDetails?.price?.currency, purchaseDetails?.price?.vatValue);

            this.updateProductExtraDetailsIfPossible(requestModel, generalInfo);
        });
    }

    private prepareUpdateExtraPropertiesDetailsRequestModel(productId: number, warehouseId: number, currency: string, vatValue: number): b2bProductDetails.UpdateExtraPropertiesDetailsRequestModel {
        return { productId, warehouseId, currency, vatValue };
    }

    updateProductDetails(requestModel: b2bProductDetails.UpdatePropertiesDetailsRequestModel) {
        const { productId, groupId } = requestModel;

        this.getProductGeneralInfo(productId, groupId).subscribe(generalInfo => {
            this.getAttributes(productId).subscribe();
            this.updateProductExtraDetailsIfPossible(requestModel, generalInfo);
        });
    }

    private updateProductExtraDetailsIfPossible(requestModel: b2bProductDetails.UpdateExtraPropertiesDetailsRequestModel, generalInfo: b2bProductDetails.ProductGeneralInfoBoth) {
        const { permissions } = generalInfo;
        const { productId, warehouseId, currency, vatValue } = requestModel;
        if (permissions.showLastOrder) {
            this.getLastOrderDetails(productId);
        }

        if (permissions.showPlannedDeliveries) {
            this.getPlannedDeliveries(productId);
        }

        if (permissions.showArticleThresholdPrices) {
            const request = this.prepareGetThresholdPriceListRequestBoth(productId, warehouseId, currency, vatValue);
            this.getThresholdPriceList(request);
        }
    }

    private prepareGetThresholdPriceListRequestBoth(articleId: number, warehouseId: number, currency: string, vatValue: number): b2bProductDetails.GetThresholdPriceListRequestBoth {
        return {
            articleId,
            warehouseId,
            currency,
            vatValue,
        };
    }


}
