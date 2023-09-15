import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { ProductBase } from '../shared/product-base/product-base';
import { Pagination } from '../shared/pagination';
import { b2b } from 'src/b2b';
import { b2bShared } from 'src/integration/b2b-shared';
import { ConfigService } from '../config.service';
import { WarehousesService } from '../warehouses.service';
import { AccountService } from '../account.service';
import { CommonAttachmentsService } from '../shared/common-attachments.service';
import { ERPService } from '../shared/erp/erp.service';
import { Observable, Subject, Subscription, of, EMPTY } from 'rxjs';
import { AddToCartContext } from '../cart/enums/add-to-cart-context.enum';
import { ProductStatus } from '../enums/product-status.enum';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { Config } from 'src/app/helpers/config';
import { ImageType } from '../shared/enums/image-type.enum';
import { b2bPromotions } from 'src/integration/b2b-promotions';
import { ApplicationType } from '../enums/application-type.enum';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { ProductDetailsRequestsService } from '../product/product-details-requests.service';
import { b2bProducts } from 'src/integration/products/b2b-products';


@Injectable()
export class PromotionDetailsService extends ProductBase {

    id: number;
    pagination: Pagination;
    productsOrDetails: b2bPromotions.PromotionItemUI[];
    config: b2b.Permissions & b2b.CustomerConfig & b2bShared.ProductTableConfig;
    promotionWarehouse: b2b.AddProductToWarehouse;
    private attachments: b2bShared.Attachment[];

    logoutSub: Subscription;

    private unitsChanged: Subject<void>;
    unitsChanged$: Observable<void>;

    constructor(httpClient: HttpClient,
        configService: ConfigService,
        warehousesService: WarehousesService,
        private accountService: AccountService,
        private commonAttachmentsService: CommonAttachmentsService,
        private productDetailsRequestsService: ProductDetailsRequestsService,
        protected erpService: ERPService) {
        super(httpClient, warehousesService, configService, erpService);

        this.pagination = new Pagination();

        this.unitsChanged = new Subject();
        this.unitsChanged$ = this.unitsChanged.asObservable();


        this.logoutSub = this.accountService.logOutSubj.subscribe(() => {
            this.productsOrDetails = undefined;
            this.config = undefined;
            this.id = undefined;
        });

    }

    protected requestDetails(id = this.id): Observable<b2bPromotions.DetailsResponseUnified> {

        return this.erpService.context.promotions.details(id, this.pagination.getRequestParams().pageNumber);
    }


    loadDetails(id = this.id) {

        return this.requestDetails(id).pipe(tap((res) => {
            this.attachments = res.promotionAttachments;
            this.config = Object.assign({}, this.configService.permissions, this.configService.config, { calculateDiscount: true, showState: false });
            this.config.addToCartContext = AddToCartContext.Promotion;

            this.id = id;

            this.productsOrDetails = res.promotionItems.map(item => {

                const newItem = Object.assign(
                    this.prepareAddingToCartProperties(item),
                    this.prepareImageBase(item.image.imageId, item.image.imageUrl, item.image.imageType),
                    {
                        imageHeight: Config.defaultArticleTableItemImageHeight,
                        imageWidth: Config.defaultArticleTableItemImageWidth
                    }
                );

                return newItem;
            });

            this.promotionWarehouse = res.warehouse;

            if (this.promotionWarehouse && this.promotionWarehouse.isPromotionForWarehouse) {
                this.config = Object.assign(this.config, { addToWarehouseId: this.promotionWarehouse.warehouseId });
            }

            this.pagination.changeParams(res.paging);

            return res;
        }));

    }

    prepareAddingToCartProperties(item: b2bPromotions.PromotionItem) {

        const newItem: b2bPromotions.PromotionItemUI = item;
        newItem.quantity = 0;
        newItem.cartId = 1;
        newItem.unitId = item.defaultUnitNo;
        newItem.status = item.itemExistsInCurrentPriceList ? ProductStatus.available : ProductStatus.unavaliable;

        if (item.auxiliaryUnit && item.denominator) {
            newItem.converter = ConvertingUtils.unitConverterString(item.denominator, item.auxiliaryUnit, item.numerator, item.basicUnit);
        }

        return newItem;
    }

    refreshAttachments() {
        this.commonAttachmentsService.updateAttachments(this.attachments.slice());
    }

    loadUnits(ids: number[]) {

        return this.requestUnitsForManyAndGroupById(ids).pipe(tap((res) => {

            for (const id in res) {
                const articleUnits: b2bProducts.articleUnitList = res[id][0];

                const indexes = [];

                this.productsOrDetails.forEach((prod, i) => {
                    if (prod.id === Number(id)) {
                        indexes.push(i);
                    }
                });

                indexes.forEach(index => {

                    this.fillUnits(index, articleUnits.units, this.productsOrDetails);

                    const defaultUnitData: b2b.UnitMapElement = {
                        basicUnit: this.productsOrDetails[index].basicUnit,
                        isUnitTotal: this.productsOrDetails[index].isUnitTotal,
                        type: this.productsOrDetails[index].type,
                        denominator: this.productsOrDetails[index].denominator,
                        numerator: this.productsOrDetails[index].numerator,
                        converter: this.productsOrDetails[index].converter
                    };

                    this.fillUnitMapElement(index, this.productsOrDetails[index].defaultUnitNo, defaultUnitData, this.productsOrDetails);
                });

            }

        }));
    }

    private prepareImageBase(imageId: number, imageUrl: string, imageType: ImageType): b2bShared.ImageBase {
        return { imageId, imageUrl, imageType };
    }

    getItemId(item: b2bPromotions.PromotionItemUI) {
        return item.id;
    }

    convertUnits(productIndex: number, unitId: number): void {
        const currentProduct = this.productsOrDetails[productIndex];
        if (this.hasCachedData(currentProduct, unitId)) {
            this.productsOrDetails[productIndex] = this.getCachedData(currentProduct, unitId);
            this.unitsChanged.next();
            return;
        }

        this.convertUnitsRequest(currentProduct, unitId)
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    this.inCaseErrorConvertUnitsBase(productIndex, unitId, err);
                    return EMPTY;
                }))
            .subscribe((updatedProduct: b2bPromotions.PromotionItemUI) => {
                this.productsOrDetails[productIndex] = updatedProduct;
                this.unitsChanged.next();
            })
    }

    private hasCachedData(currentProduct: b2bPromotions.PromotionItemUI, unitId: number) {
        const unitData = currentProduct.units.get(unitId);
        return unitData && unitData.areUnitDataFilled;
    }

    private getCachedData(currentProduct: b2bPromotions.PromotionItemUI, unitId: number) {
        const unitData = currentProduct.units.get(unitId);
        return {
            ...currentProduct,
            ...unitData
        };
    }

    //TODO - temp sollution, finally `convertUnitsRequest` should be in one place, and shared by product list and details
    private convertUnitsRequest(currentProduct: b2bPromotions.PromotionItemUI, unitId: number): Observable<b2bPromotions.PromotionItemUI> {
        const request = this.prepareConvertUnitsBaseRequest(currentProduct.id, unitId);

        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.convertUnitsXlRequest(currentProduct, request);
            case ApplicationType.ForAltum:
                return this.convertUnitsAltumRequest(currentProduct, request);
            default:
                console.error(`convertUnits(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private prepareConvertUnitsBaseRequest(productId: number, unitId: number): b2bProductDetails.ConvertUnitsBaseRequest {
        return {
            id: productId,
            unitId,
            warehouseId: 0,
        };
    }

    private convertUnitsXlRequest(currentProduct: b2bPromotions.PromotionItemUI, request: b2bProductDetails.ConvertUnitsBaseRequest): Observable<b2bPromotions.PromotionItemUI> {
        return this.productDetailsRequestsService.unitConverterXlRequest(request).pipe(
            map((response: b2bProductDetails.ConvertUnitsXlResponse) => {
                return this.updateProductDetailsBase(currentProduct, response);
            }))
    }

    private convertUnitsAltumRequest(currentProduct: b2bPromotions.PromotionItemUI, request: b2bProductDetails.ConvertUnitsBaseRequest): Observable<b2bPromotions.PromotionItemUI> {
        return this.productDetailsRequestsService.unitConverterAltumRequest(request).pipe(
            map((response: b2bProductDetails.ConvertUnitsAltumResponse) => {
                return this.updateProductDetailsBase(currentProduct, response);
            }))
    }

    private updateProductDetailsBase(currentProduct: b2bPromotions.PromotionItemUI, productPurchaseDetails: b2bProductDetails.ProductPurchaseDetailsBase): b2bPromotions.PromotionItemUI {
        const unitData: b2b.UnitMapElement = this.prepareUnitBaseData(productPurchaseDetails);
        currentProduct.units.set(unitData.unitId, unitData);

        return {
            ...currentProduct,
            ...unitData,
        };
    }

    private prepareUnitBaseData(productPurchaseDetails: b2bProductDetails.ProductPurchaseDetailsBase): b2b.UnitMapElement {
        const { unit } = productPurchaseDetails;

        let converter: string;
        let currentUnit: string = unit.basicUnit;
        let denominator: number;
        let numerator: number;

        //TODO - poprawić na backendzie i sprawdzać flagę "denominator.representsExistingValue", ghdy bedzie ona już uwzgledniała jednostkę pomocniczą
        if (unit.auxiliaryUnit.representsExistingValue) {
            currentUnit = unit.auxiliaryUnit.unit;
            denominator = unit.denominator.value;
            numerator = unit.numerator.value;
            converter = ConvertingUtils.unitConverterString(unit.denominator.value, currentUnit, unit.numerator.value, unit.basicUnit);
        }

        return {
            denominator,
            numerator,
            isUnitTotal: <0 | 1>(unit.isUnitTotal ? 1 : 0),
            basicUnit: unit.basicUnit,
            converter,
            unitLockChange: unit.unitLockChange,
            unitId: unit.defaultUnitNo,
            defaultUnitNo: unit.defaultUnitNo,
            unit: currentUnit,
            auxiliaryUnit: currentUnit,
            areUnitDataFilled: true,
        };
    }

    private inCaseErrorConvertUnitsBase(productIndex: number, unitId: number, err: HttpErrorResponse) {
        if (err.status === 204) {
            this.restoreDefaultUnit(productIndex, unitId);
        }
        this.unitsChanged.next();
    }

    private restoreDefaultUnit(productIndex: number, unitId: number) {
        if (this.productsOrDetails[productIndex].units) {
            this.productsOrDetails[productIndex].units.delete(unitId);
        }

        const unitElement = this.productsOrDetails[productIndex].units.get(this.productsOrDetails[productIndex].defaultUnitNo);
        this.productsOrDetails[productIndex].unitId = this.productsOrDetails[productIndex].defaultUnitNo;
        this.productsOrDetails[productIndex] = {
            ...this.productsOrDetails[productIndex],
            ...unitElement,
            unitId: this.productsOrDetails[productIndex].defaultUnitNo,
            converter: null,
        }
    }
}
