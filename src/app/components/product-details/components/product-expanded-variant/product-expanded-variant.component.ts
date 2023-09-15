import { Component, Input, OnInit, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { UnsubscribeComponent } from 'src/app/components/common/unsubscribe.component';
import { ConfigService } from 'src/app/model/config.service';
import { ProductExpandedVariantService } from '../../services/product-expanded-variant.service';
import { OptionBaseStatus } from 'src/app/model/shared/enums/option-base-status.enum';

@Component({
    selector: 'app-product-expanded-variant',
    templateUrl: './product-expanded-variant.component.html',
    styleUrls: ['./product-expanded-variant.component.scss'],
    host: { 'class': 'app-product-expanded-variant' },
    encapsulation: ViewEncapsulation.None,
})
export class ProductExpandedVariantComponent extends UnsubscribeComponent implements OnInit {

    private currentSelectedVariantProductId: number;

    displayedColumns: string[];

    expandedVariant: b2bProductDetails.ExpandedProductVariant;
    expandedVariantGridRows: b2bProductDetails.ExpandedProductVariantGridRow[];

    @Input()
    translations: any;

    @Output()
    loadPurchaseDetails: EventEmitter<number[]>;

    @Output()
    optionChanged: EventEmitter<b2bProductDetails.ChangeProductVariantModel>;

    @Output()
    variantPreviewChanged: EventEmitter<b2bProductDetails.ProductVariantPreview>;

    @Output()
    unitChanged: EventEmitter<b2bProductDetails.UnitChangedModel>;

    @Output()
    warehouseChanged: EventEmitter<b2bProductDetails.WarehouseChangedModel>;

    constructor(public configService: ConfigService,
        private productExpandedVariantService: ProductExpandedVariantService) {
        super();
        this.loadPurchaseDetails = new EventEmitter();
        this.optionChanged = new EventEmitter();
        this.variantPreviewChanged = new EventEmitter();
        this.unitChanged = new EventEmitter();
        this.warehouseChanged = new EventEmitter();
    }

    ngOnInit() {
        this.displayedColumns = this.productExpandedVariantService.prepareDisplayedColumns(this.configService.config.priceMode, this.configService.config.showState, this.configService.isMobile, this.configService.permissions.hasAccessToPriceList);

        this.registerSub(this.productExpandedVariantService.expandedVariantChanged$.subscribe(this.onExpandedVariantChanged.bind(this)));
        this.registerSub(this.productExpandedVariantService.purchaseDetailsChanged$.subscribe(this.onPurchaseDetailsChanged.bind(this)));
        this.registerSub(this.productExpandedVariantService.productVariantsQuantityReset$.subscribe(this.onResetProductVariantsQuantity.bind(this)));
        this.registerSub(this.productExpandedVariantService.currentWarehouseChanged$.subscribe(this.onCurrentWarehouseChanged.bind(this)));
    }

    private onExpandedVariantChanged(expandedVariant: b2bProductDetails.ExpandedProductVariant) {
        this.currentSelectedVariantProductId = null;
        this.expandedVariant = expandedVariant;
        this.updateExpandedVariantValues(expandedVariant);
    }

    private updateExpandedVariantValues(expandedVariant: b2bProductDetails.ExpandedProductVariant) {
        const rows = [];

        expandedVariant?.expandedValues?.forEach(expandedValue => {
            rows.push({
                productId: expandedValue.articleId,
                variantValue: expandedValue.value,
                productStatus: expandedValue.articleStatus,
                productType: expandedValue.articleType,
                currentQuantity: 0,
                loading: true,
            } as b2bProductDetails.ExpandedProductVariantGridRow);
        });

        this.expandedVariantGridRows = rows;
        this.loadPurchaseDetailsIfPossible(rows);
    }

    private loadPurchaseDetailsIfPossible(gridRows: b2bProductDetails.ExpandedProductVariantGridRow[]) {
        const productIds = gridRows?.map(row => row.productId);

        if (productIds) {
            this.loadPurchaseDetails.emit(productIds);
        }
    }

    onPurchaseDetailsChanged(summary: b2bProductDetails.ProductPurchaseDetailsSummary) {
        if (!summary) {
            return;
        }

        this.expandedVariantGridRows = this.expandedVariantGridRows?.map(row => {
            if (row.productId === summary.productId) {
                return this.updateExpandedVariantPurchaseDetails(row, summary);
            }
            return row;
        });
    }

    private updateExpandedVariantPurchaseDetails(currentRow: b2bProductDetails.ExpandedProductVariantGridRow, summary: b2bProductDetails.ProductPurchaseDetailsSummary) {
        const updatedRow = {
            ...currentRow,
            ...summary,
            loading: false,
            currentUnitId: summary.purchaseDetails.unit.defaultUnitNo,
        } as b2bProductDetails.ExpandedProductVariantGridRow;

        this.updateProductVariantPreview(summary.productId, updatedRow.currentQuantity, updatedRow.currentUnitId);

        if (!this.currentSelectedVariantProductId && updatedRow.variantValue.status === OptionBaseStatus.Checked) {
            this.changeCurrentSelectedOption(updatedRow);
        }

        return updatedRow;
    }

    changeQuantity(quantity: number, row: b2bProductDetails.ExpandedProductVariantGridRow) {
        row.currentQuantity = quantity;
        this.updateProductVariantPreview(row.productId, quantity, row.currentUnitId);
    }

    onUnitChange(row: b2bProductDetails.ExpandedProductVariantGridRow) {
        this.updateProductVariantPreview(row.productId, row.currentQuantity, row.currentUnitId);

        row.loading = true;
        this.unitChanged.emit({ productId: row.productId, unitId: row.currentUnitId });
    }

    private updateProductVariantPreview(productId: number, quantity: number, unitId: number) {
        const model = { productId, quantity, unitId: unitId } as b2bProductDetails.ProductVariantPreview;
        this.variantPreviewChanged.emit(model);
    }

    onClickOption(currentRow: b2bProductDetails.ExpandedProductVariantGridRow) {
        this.expandedVariantGridRows = this.expandedVariantGridRows?.map(row => {
            if (row.variantValue.status === OptionBaseStatus.Checked) {
                row.variantValue.status = OptionBaseStatus.Available;
            }
            if (row.productId === currentRow.productId) {
                row.variantValue.status = OptionBaseStatus.Checked;
            }
            return row;
        });

        this.changeCurrentSelectedOption(currentRow);
    }

    private changeCurrentSelectedOption(currentRow: b2bProductDetails.ExpandedProductVariantGridRow) {
        this.currentSelectedVariantProductId = currentRow.productId;

        const model = {
            productId: currentRow.productId,
            purchaseDetails: currentRow.purchaseDetails,
        } as b2bProductDetails.ChangeProductVariantModel;

        this.optionChanged.emit(model);
    }

    onResetProductVariantsQuantity() {
        this.expandedVariantGridRows?.forEach(row => {
            this.changeQuantity(0, row);
        });
    }

    onCurrentWarehouseChanged(warehouseId: number) {
        this.expandedVariantGridRows?.forEach(row => {
            row.loading = true;
            this.warehouseChanged.emit({ productId: row.productId, warehouseId, unitId: row.currentUnitId });
        });
    }
}
