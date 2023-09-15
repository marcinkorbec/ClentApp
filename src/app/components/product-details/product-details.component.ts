import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourcesService } from '../../model/resources.service';
import { ProductDetailsService } from '../../model/product-details.service';
import { throwError } from 'rxjs';
import { b2b } from '../../../b2b';
import { CartsService } from '../../model/carts.service';
import { UiUtils } from '../../helpers/ui-utils';
import { ConfigService } from '../../model/config.service';
import { WarehousesService } from '../../model/warehouses.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, withLatestFrom } from 'rxjs/operators';
import { MenuService } from 'src/app/model/menu.service';
import { CommonModalService } from 'src/app/model/shared/common-modal.service';
import { Config } from '../../helpers/config';
import { StoresService } from '../../model/store/stores.service';
import { b2bStore } from 'src/integration/store/b2b-store';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { ProductDetailsType } from 'src/app/model/product/enums/product-details-type.enum';
import { b2bShared } from 'src/integration/b2b-shared';
import { ProductsVariantsService } from './services/product-variants.service';
import { GroupsService } from 'src/app/model/groups/groups.service';
import { UnsubscribeComponent } from '../common/unsubscribe.component';

@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.scss'],
    host: { 'class': 'app-product-details' },
    providers: [ProductDetailsService],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsComponent extends UnsubscribeComponent implements OnInit, OnDestroy {
    r: ResourcesService;

    productId: number;

    productDetailsType: ProductDetailsType;

    product: ProductDetailsService;

    keys: Function;

    tabsVisible: boolean;

    scrollToLabel: Function;

    errorMessage: string;
    hasError: boolean;

    productsDetailsLoading: b2bProductDetails.ProductDetailsLoadingSummary;

    breadcrumbs: b2b.Breadcrumb[];

    groupId?: number;

    lastOrderDetails: b2bProductDetails.LastOrderDetails;
    plannedDeliveries: b2bProductDetails.PlannedDelivery[];

    stores: b2bStore.StoreIdentifier[];

    thresholdPriceLists: b2bProductDetails.ThresholdPriceLists;

    currentPurchaseDetails: b2bProductDetails.ProductPurchaseDetailsBothIntersection;
    currentUnitsSummary: b2bProductDetails.ProductUnitsSummary;
    currentUnitsLength: number;

    productAttributesSummary: b2bProductDetails.ProductAttributesSummary;

    generalInfo: b2bProductDetails.ProductGeneralInfoBothIntersection;
    productBaseInfo: b2bShared.ArticleBothIntersection;
    productBasicDetails: b2bProductDetails.ProductBasicDetails;

    currentQuantity: number;
    currentUnitId: number;
    currentWarehouseId: number;
    currentSelectedVariantProductId: number;

    replacementsVisibleSlidesAmount: number;

    constructor(
        private activatedRoute: ActivatedRoute,
        public groupsService: GroupsService,
        resourcesService: ResourcesService,
        public configService: ConfigService,
        private cartsService: CartsService,
        productDetailsService: ProductDetailsService,
        public warehousesService: WarehousesService,
        public changeDetector: ChangeDetectorRef,
        public menuService: MenuService,
        private commonModalService: CommonModalService,
        private storesService: StoresService,
        private productsVariantsService: ProductsVariantsService
    ) {

        super();
        this.r = resourcesService;
        this.product = productDetailsService;
        this.replacementsVisibleSlidesAmount = 2;

        //TODO temp solution
        this.productDetailsType = ProductDetailsType.NotContainVariants;
        this.currentQuantity = 1;
        this.productsDetailsLoading = {};
    }

    ngOnInit() {
        this.keys = Object.keys;

        this.initWarehouses();
        this.watchChanges();

        this.scrollToLabel = UiUtils.scrollToLabel;
    }

    private watchChanges() {
        this.registerSub(this.activatedRoute.params
            .pipe(
                withLatestFrom(this.activatedRoute.queryParams),
                map(results => ({ params: results[0], query: results[1] })))
            .subscribe(this.activeRouteValuesChanged.bind(this)));

        this.registerSub(this.groupsService.groupChanged$.subscribe(res => {
            if (res) {
                this.breadcrumbs = res.history;
                this.changeDetector.markForCheck();
            }
        }));

        this.registerSub(this.product.productPurchaseDetailsSummaryChanged$.subscribe(this.currentPurchaseDetailsChanged.bind(this)));
        this.registerSub(this.product.productAttributesSummaryChanged$.subscribe(this.productAttributesSummaryChanged.bind(this)));
        this.registerSub(this.product.productGeneralInfoChanged$.subscribe(this.productGeneralInfoChanged.bind(this)));
        this.registerSub(this.product.productVariantsChanged$.subscribe(this.productVariantsChanged.bind(this)));

        this.registerSub(this.product.plannedDeliveries$.subscribe(res => {
            this.plannedDeliveries = res;
            this.changeDetector.markForCheck();
        }));

        this.registerSub(this.product.lastOrderDetails$.subscribe(res => {
            this.lastOrderDetails = res;
            this.changeDetector.markForCheck();
        }));

        this.registerSub(this.product.thresholdPriceListsChanged.subscribe(res => {
            this.thresholdPriceLists = res;
            this.changeDetector.markForCheck();
        }));

        this.registerSub(this.storesService.storesChanged.subscribe(res => {
            this.stores = res;
            this.changeDetector.markForCheck();
        }));
    }

    private activeRouteValuesChanged(results: any) {
        this.configService.loaderSubj.next(true);

        this.hasError = false;

        window.scrollTo(0, 0);

        this.productId = results?.params?.id ? Number(results.params.id) : null;
        this.groupId = results?.query?.group ? Number(results.query.group) : null;

        this.getProuductDetails(this.productId, this.groupId);
    }

    private currentPurchaseDetailsChanged(summary: b2bProductDetails.ProductPurchaseDetailsSummary) {
        switch (this.productDetailsType) {
            case ProductDetailsType.NotContainVariants:
                this.purchaseDetailsWithoutVariantsChanged(summary);
                break;

            case ProductDetailsType.ContainsVariants:
                this.purchaseDetailsWithVariantsChanged(summary);
                break;
        }

        this.stopPurchaseDetailsLoading();
        this.changeDetector.markForCheck();
    }

    private purchaseDetailsWithoutVariantsChanged(summary: b2bProductDetails.ProductPurchaseDetailsSummary) {
        this.currentPurchaseDetails = summary?.purchaseDetails;
        this.currentUnitsSummary = summary?.unitsSummary;
        this.currentUnitsLength = summary?.unitsLength;
        this.currentUnitId = this.currentPurchaseDetails?.unit?.unitId;
    }

    private purchaseDetailsWithVariantsChanged(summary: b2bProductDetails.ProductPurchaseDetailsSummary) {
        if (this.currentSelectedVariantProductId === summary.productId) {
            this.currentPurchaseDetails = summary?.purchaseDetails;
        }
        this.productsVariantsService.updatePurchaseDetails(summary);
    }

    private productAttributesSummaryChanged(summary: b2bProductDetails.ProductAttributesSummary) {
        this.productAttributesSummary = summary;

        this.updateTabsVisibility();
        this.stopAttributesLoading();
        this.changeDetector.markForCheck();
    }

    private productGeneralInfoChanged(generalInfo: b2bProductDetails.ProductGeneralInfoBoth) {
        this.generalInfo = generalInfo;
        this.productBaseInfo = generalInfo?.article;
        this.productBasicDetails = generalInfo?.articleBasicDetails;

        this.updateTabsVisibility();
        this.stopGeneralInfoLoading();
        this.changeDetector.markForCheck();
    }

    private productVariantsChanged(summary: b2bProductDetails.ProductVariantsSummary) {
        this.productsVariantsService.changeVariantsSummary(summary);
        this.changeDetector.markForCheck();
    }

    private initWarehouses() {
        this.warehousesService.loadWarehouses();
        this.currentWarehouseId = this.warehousesService.lastSelectedWarehouseId;
    }


    getProuductDetails(productId: number, groupId: number) {
        this.resetFullProductData();

        this.product.getProuductDetails(productId, groupId, this.currentWarehouseId).pipe(
            catchError(error => {
                return this.inCaseErrorGetProductDetails(error);
            })
        ).subscribe((detailsType: ProductDetailsType) => {
            this.configService.loaderSubj.next(false);

            this.productDetailsType = detailsType;
            this.initProductsDetailsLoading();
            this.changeDetector.markForCheck();
        });
    }

    private inCaseErrorGetProductDetails(error: HttpErrorResponse) {
        this.hasError = true;
        this.configService.loaderSubj.next(false);

        if (error?.status === 403) {
            this.errorMessage = this.r.translations.forbiddenProduct;
            this.changeDetector.markForCheck();
            return throwError(error);
        }

        if (!this.configService.isOnline) {
            this.errorMessage = this.r.translations.noDataInOfflineMode;
        } else {
            this.errorMessage = `${this.r.translations.loadProductDetailsError}. ${this.r.translations.stepsAfterErrorMessage}.`;
        }

        this.changeDetector.markForCheck();
        return throwError(error);
    }

    onReplacementUnitChange(unitId: number, index: number) {
        this.product.changeReplacementUnit(unitId, index).then(() => {
            this.changeDetector.markForCheck();
        });
    }

    onProductUnitChange(unitId: number) {
        this.productsDetailsLoading.purchaseDetailsLoading = true;
        this.product.convertUnits(this.productId, this.currentWarehouseId, unitId);
    }

    changeWarehouse(warehouseId: number) {
        switch (this.productDetailsType) {
            case ProductDetailsType.NotContainVariants:
                this.productsDetailsLoading.purchaseDetailsLoading = true;
                this.product.changeWarehouse(this.productId, warehouseId, this.currentUnitId);
                break;
            case ProductDetailsType.ContainsVariants:
                this.productsVariantsService.updateCurrentWarehouse(warehouseId);
        }
    }

    addToCart(cartId: number) {
        if (!cartId) {
            this.commonModalService.showNoAvailableCartsModalMessage();
            return;
        }

        if (this.currentQuantity === 0) {
            return;
        }
        this.configService.loaderSubj.next(true);

        const request: b2b.AddToCartRequest = {
            cartId,
            warehouseId: this.currentWarehouseId,
            createNewCart: cartId === Config.createNewCartId,
            items: [{
                articleId: this.productId,
                quantity: this.currentQuantity,
                unitDefault: this.currentUnitId,
            }]
        };

        this.cartsService.addToCart(request).then(() => {
            this.currentQuantity = 1;
            this.configService.loaderSubj.next(false);
        }).catch((err) => {
            this.configService.loaderSubj.next(false);
        });
    }

    addReplacementToCart(index) {
        if (!this.product.replacements[index].cartId) {
            this.commonModalService.showNoAvailableCartsModalMessage();
            return;
        }

        if (this.product.replacements[index].quantity === 0) {
            return;
        }
        this.configService.loaderSubj.next(true);
        const request: b2b.AddToCartRequest = {
            cartId: this.product.replacements[index].cartId,
            warehouseId: this.currentWarehouseId,
            createNewCart: this.product.replacements[index].cartId === Config.createNewCartId,
            items: [{
                articleId: this.product.replacements[index].id,
                quantity: this.product.replacements[index].quantity,
                unitDefault: this.product.replacements[index].unitId
            }]
        };

        this.cartsService.addToCart(request)
            .then(() => {
                this.configService.loaderSubj.next(false);
            })
            .catch(() => {
                this.configService.loaderSubj.next(false);
            });
    }


    changeProductQuantity(quantity: number) {
        this.currentQuantity = quantity;
    }

    changeReplacementQuantity(index: number, quantity: number) {
        this.product.replacements[index].quantity = quantity;
        window.setTimeout(() => {
            this.changeDetector.markForCheck();
        }, 0);
    }

    private updateTabsVisibility() {
        this.tabsVisible = this.areTabsVisible();
    }

    private areTabsVisible(): boolean {
        const visibilityConditions = [
            !!this.productBasicDetails?.description,
            this.productAttributesSummary?.articleAttributes?.length > 0,
            this.productAttributesSummary?.articleAttachments?.length > 0,
            this.product?.replacements?.length > 0
        ];

        return visibilityConditions.filter(item => item === true).length > 1;
    }

    loadWarehouses() {
        this.warehousesService.loadWarehouses().then(() => {
            this.changeDetector.markForCheck();
        });

    }

    loadVisibleReplacementsAndAllUnits() {

        this.product.loadVisibleReplacementsAndAllUnits(this.currentWarehouseId).then(() => {
            window.setTimeout(() => {
                this.changeDetector.markForCheck();
            }, 0);
        });
    }

    loadUnvisibleReplacement(replacementIndex) {

        const replacementIndexesToLoad =  Array.from({ length: this.replacementsVisibleSlidesAmount }, (el, i) => replacementIndex + i - 1);

        this.product.loadUnvisibleReplacements(replacementIndexesToLoad, this.currentWarehouseId).then(() => {
            window.setTimeout(() => {
                this.changeDetector.markForCheck();
            }, 0);
        });
    }

    replacementTrackByFn(i, el) {
        return el.id || i;
    }

    private prepareItemsToAddToStore(): b2bStore.AddItemToStore[] {
        return [
            {
                articleId: this.productId,
                quantity: this.currentQuantity,
                unitId: this.currentUnitId
            }
        ];
    }

    addProductToStore(storeId: number) {
        const items = this.prepareItemsToAddToStore();
        this.addManyToStore(storeId, items);
    }

    private addManyToStore(storeId: number, items: b2bStore.AddItemToStore[]) {
        if (storeId === Config.createNewStoreId) {
            this.storesService.createStore(items);
        } else {
            this.storesService.addToStore(storeId, items);
        }
    }

    private initProductsDetailsLoading() {
        this.productsDetailsLoading = {
            attributesLoading: true,
            galleryLoading: true,
            generalInfoLoading: true,
            purchaseDetailsLoading: true,
        };
    }

    private stopGeneralInfoLoading() {
        this.productsDetailsLoading = {
            ...this.productsDetailsLoading,
            generalInfoLoading: false,
            nameLoading: false,
            flagLoading: false,
        };
    }

    private stopAttributesLoading() {
        this.productsDetailsLoading = {
            ...this.productsDetailsLoading,
            attributesLoading: false,
            galleryLoading: false,
        };
    }

    private stopPurchaseDetailsLoading() {
        this.productsDetailsLoading.purchaseDetailsLoading = false;
    }

    private resetProductDetails() {
        this.resetCommonProductData();
        if (this.productAttributesSummary) {
            this.productAttributesSummary.articleImages = null;
        }
    }

    private resetFullProductData() {
        this.resetCommonProductData();
        this.productAttributesSummary = null;
        this.generalInfo = null;
        this.productBaseInfo = null;
    }

    private resetCommonProductData() {
        this.product.replacements = undefined;
        this.product.replacementsPromises = undefined;
        this.thresholdPriceLists = null;
        this.plannedDeliveries = null;
        this.lastOrderDetails = null;
        this.productBasicDetails = null;
    }

    onSwitchVariantsChanged(models: b2bShared.PropertyValuePreviewModel[]) {
        this.product.getProuductVariantsDetails(this.productId, models).subscribe();
    }

    onProductVariantChanged(model: b2bProductDetails.ChangeProductVariantModel) {
        this.currentSelectedVariantProductId = model.productId;
        this.currentPurchaseDetails = model.purchaseDetails;

        this.resetProductDetails();
        this.initProductsDetailsLoading();

        const requestModel = {
            productId: model.productId,
            currency: model.purchaseDetails?.price?.currency,
            vatValue: model.purchaseDetails?.price?.vatValue,
            groupId: this.groupId,
            warehouseId: this.currentWarehouseId,
        } as b2bProductDetails.UpdatePropertiesDetailsRequestModel;

        this.product.updateProductDetails(requestModel);
        this.changeDetector.markForCheck();
    }

    onLoadPurchaseDetails(productIds: number[]) {
        this.product.getManyArticlePurchaseDetails(productIds, this.currentWarehouseId);
    }

    onUnitChanged(model: b2bProductDetails.UnitChangedModel) {
        this.product.convertUnits(model.productId, this.currentWarehouseId, model.unitId);
    }

    onWarehouseChanged(model: b2bProductDetails.WarehouseChangedModel) {
        this.product.changeWarehouse(model.productId, model.warehouseId, model.unitId);
    }

    onAddProductVariantsToCart(model: b2bProductDetails.ProductVariantAddToCartModel) {
        this.configService.loaderSubj.next(true);
        const request = this.prepareAddManyToCartRequest(model);
        this.addManyToCart(request);
    }

    private prepareAddManyToCartRequest(data: b2bProductDetails.ProductVariantAddToCartModel): b2b.AddToCartRequest {
        const items = data.variantsPreviewModels?.map(model => {
            return {
                articleId: model.productId,
                quantity: model.quantity,
                unitDefault: model.unitId
            } as b2b.AddToCartRequestItem;
        });

        return {
            cartId: data.cartId,
            warehouseId: this.currentWarehouseId,
            createNewCart: data.cartId === Config.createNewCartId,
            items,
        };
    }

    addManyToCart(request: b2b.AddToCartRequest) {
        this.cartsService.addToCart(request).then(() => {
            this.productsVariantsService.resetProductVariantsQuantity();
            this.changeDetector.markForCheck();
            this.configService.loaderSubj.next(false);
        }).catch(() => {
            this.configService.loaderSubj.next(false);
        });
    }

    onAddProductVariantsToStore(model: b2bProductDetails.ProductVariantAddToStoreModel) {
        this.configService.loaderSubj.next(true);
        const items = this.prepareAddManyToStoreItems(model);
        this.addManyToStore(model.storeId, items);
        this.productsVariantsService.resetProductVariantsQuantity();
    }

    private prepareAddManyToStoreItems(data: b2bProductDetails.ProductVariantAddToStoreModel): b2bStore.AddItemToStore[] {
        return data.variantsPreviewModels?.map(model => {
            return {
                articleId: model.productId,
                quantity: model.quantity,
                unitId: model.unitId
            } as b2bStore.AddItemToStore;
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.resetFullProductData();
    }
}
