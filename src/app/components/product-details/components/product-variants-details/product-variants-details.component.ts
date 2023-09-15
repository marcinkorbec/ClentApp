import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { b2bShared } from 'src/integration/b2b-shared';
import { ApplicationType } from 'src/app/model/enums/application-type.enum';
import { ProductsVariantsService } from '../../services/product-variants.service';
import { UnsubscribeComponent } from '../../../common/unsubscribe.component';
import { ProductExpandedVariantService } from '../../services/product-expanded-variant.service';
import { ConfigService } from 'src/app/model/config.service';
import { b2bStore } from 'src/integration/store/b2b-store';
import { MenuService } from 'src/app/model/menu.service';
import { Config } from 'src/app/helpers/config';
import { ProductVariantsModalStatus } from 'src/app/model/product/enums/product-variants-modal-status.enum';

@Component({
    selector: 'app-product-variants-details',
    templateUrl: './product-variants-details.component.html',
    styleUrls: ['./product-variants-details.component.scss'],
    host: { 'class': 'app-product-variants-details' },
    encapsulation: ViewEncapsulation.None,
})
export class ProductVariantsDetailsComponent extends UnsubscribeComponent implements OnInit {

    switchControlModels: b2bShared.SwitchControlModel[];
    productVariantsSummary: b2bProductDetails.ProductVariantSummary;

    variantsLoading: boolean;
    notificationModalData: b2bProductDetails.ProductVariantsNotificationModalData;

    @Input()
    translations: any;

    @Input()
    applicationType: ApplicationType;

    @Input()
    generalInfo: b2bProductDetails.ProductGeneralInfoBothIntersection;
    get productBaseInfo(): b2bShared.ArticleBothIntersection { return this.generalInfo?.article; }
    get productBasicDetails(): b2bProductDetails.ProductBasicDetails { return this.generalInfo?.articleBasicDetails; }

    @Input()
    thresholdPriceLists: b2bProductDetails.ThresholdPriceLists;

    @Input()
    stores: b2bStore.StoreIdentifier[];

    @Input()
    plannedDeliveries: b2bProductDetails.PlannedDelivery[];

    @Input()
    lastOrderDetails: b2bProductDetails.LastOrderDetails;

    //<!--PG początek-->
    @Input()
    productAttributesSummary: b2bProductDetails.ProductAttributesSummary;
    //<!--PG koniec-->
    @Output()
    switchVariantsChanged: EventEmitter<b2bShared.PropertyValuePreviewModel[]>;

    @Output()
    productVariantChanged: EventEmitter<b2bProductDetails.ChangeProductVariantModel>;

    @Output()
    loadPurchaseDetails: EventEmitter<number[]>;

    @Output()
    unitChanged: EventEmitter<b2bProductDetails.UnitChangedModel>;

    @Output()
    warehouseChanged: EventEmitter<b2bProductDetails.WarehouseChangedModel>;

    @Output()
    addToCart: EventEmitter<b2bProductDetails.ProductVariantAddToCartModel>;

    @Output()
    addToStore: EventEmitter<b2bProductDetails.ProductVariantAddToStoreModel>;

    constructor(private productsVariantsService: ProductsVariantsService,
        private productExpandedVariantService: ProductExpandedVariantService,
        public configService: ConfigService,
        public menuService: MenuService) {
        super();
        this.switchVariantsChanged = new EventEmitter();
        this.productVariantChanged = new EventEmitter();
        this.loadPurchaseDetails = new EventEmitter();
        this.unitChanged = new EventEmitter();
        this.warehouseChanged = new EventEmitter();
        this.addToCart = new EventEmitter();
        this.addToStore = new EventEmitter();

        this.productVariantsSummary = {};
        this.variantsLoading = true;

        this.notificationModalData = {
            isOpened: false,
            autoCloseTimeout: Config.autoCloseProductVariantsNotificationsModalTimeout,
            autoClose: true,
        };
    }

    ngOnInit() {
        this.registerSub(this.productsVariantsService.variantsSummaryChanged$.subscribe(this.onVariantsSummaryChanged.bind(this)));
        this.registerSub(this.productsVariantsService.purchaseDetailsChanged$.subscribe(this.onPurchaseDetailsChanged.bind(this)));
        this.registerSub(this.productsVariantsService.productVariantsQuantityReset$.subscribe(this.onResetProductVariantsQuantity.bind(this)));
        this.registerSub(this.productsVariantsService.currentWarehouseChanged$.subscribe(this.onCurrentWarehouseChanged.bind(this)));
    }

    private onVariantsSummaryChanged(summary: b2bProductDetails.ProductVariantsSummary) {
        this.switchControlModels = this.productsVariantsService.prepareSwitchControlModels(summary.headerVariants);
        this.productExpandedVariantService.updateExpandedVariant(summary?.expandedVariant);
        this.variantsLoading = false;
    }

    onSwitchOptionChanged(previewModel: b2bShared.PropertyValuePreviewModel) {
        this.variantsLoading = true;
        const models = this.productsVariantsService.prepareSelectedSwitchModels(this.switchControlModels, previewModel);
        this.switchVariantsChanged.emit(models);
    }

    onLoadPurchaseDetails(productIds: number[]) {
        this.loadPurchaseDetails.emit(productIds);
    }

    onPurchaseDetailsChanged(summary: b2bProductDetails.ProductPurchaseDetailsSummary) {
        this.productExpandedVariantService.updatePurchaseDetails(summary);
    }

    onProductVariantChanged(model: b2bProductDetails.ChangeProductVariantModel) {
        this.productVariantChanged.emit(model);
    }

    onVariantPreviewChanged(data: b2bProductDetails.ProductVariantPreview) {
        this.productVariantsSummary[data.productId] = data;
    }

    onUnitChanged(model: b2bProductDetails.UnitChangedModel) {
        this.unitChanged.emit(model);
    }

    onClickAddToCart(cartId: number) {
        const selectedModels = this.prepareSelectedVariantsModels();
        if (selectedModels.length > 0) {
            this.addToCart.emit({ cartId, variantsPreviewModels: selectedModels });
        } else {
            this.openNotificationModal(ProductVariantsModalStatus.NoQuantitySelected);
        }
    }

    onClickAddToStore(storeId: number) {
        const selectedModels = this.prepareSelectedVariantsModels();
        if (selectedModels.length > 0) {
            this.addToStore.emit({ storeId, variantsPreviewModels: selectedModels });
        } else {
            this.openNotificationModal(ProductVariantsModalStatus.NoQuantitySelected);
        }
    }

    private prepareSelectedVariantsModels() {
        if (!this.productVariantsSummary) {
            return;
        }

        return Object.values(this.productVariantsSummary).filter((model: b2bProductDetails.ProductVariantPreview) => model.quantity > 0);
    }

    onResetProductVariantsQuantity() {
        this.productExpandedVariantService.resetProductVariantsQuantity();
    }

    onCurrentWarehouseChanged(warehouseId: number) {
        this.productExpandedVariantService.updateCurrentWarehouse(warehouseId);
    }

    onWarehouseChanged(model: b2bProductDetails.WarehouseChangedModel) {
        this.warehouseChanged.emit(model);
    }

    openNotificationModal(status: ProductVariantsModalStatus) {
        this.notificationModalData = {
            ...this.notificationModalData,
            isOpened: true,
            status,
        };
    }

    closeNotificationModal() {
        this.notificationModalData.isOpened = false;
    }
}
