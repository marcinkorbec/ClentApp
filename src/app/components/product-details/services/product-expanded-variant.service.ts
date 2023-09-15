import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { PriceMode } from 'src/app/model/enums/price-mode.enum';
import { b2bProductDetails } from 'src/integration/b2b-product-details';

@Injectable()
export class ProductExpandedVariantService {

    private _expandedVariantChanged: Subject<b2bProductDetails.ExpandedProductVariant>;
    expandedVariantChanged$: Observable<b2bProductDetails.ExpandedProductVariant>;

    private _purchaseDetailsChanged: Subject<b2bProductDetails.ProductPurchaseDetailsSummary>;
    purchaseDetailsChanged$: Observable<b2bProductDetails.ProductPurchaseDetailsSummary>;

    private _productVariantsQuantityReset: Subject<void>;
    productVariantsQuantityReset$: Observable<void>;

    private _currentWarehouseChanged: Subject<number>;
    currentWarehouseChanged$: Observable<number>;

    constructor() {
        this._expandedVariantChanged = new Subject();
        this.expandedVariantChanged$ = this._expandedVariantChanged.asObservable();

        this._purchaseDetailsChanged = new Subject();
        this.purchaseDetailsChanged$ = this._purchaseDetailsChanged.asObservable();

        this._productVariantsQuantityReset = new Subject();
        this.productVariantsQuantityReset$ = this._productVariantsQuantityReset.asObservable();

        this._currentWarehouseChanged = new Subject();
        this.currentWarehouseChanged$ = this._currentWarehouseChanged.asObservable();
    }

    updateExpandedVariant(expandedVariant: b2bProductDetails.ExpandedProductVariant) {
        this._expandedVariantChanged.next(expandedVariant);
    }

    updatePurchaseDetails(summary: b2bProductDetails.ProductPurchaseDetailsSummary) {
        this._purchaseDetailsChanged.next(summary);
    }

    prepareDisplayedColumns(priceMode: PriceMode, showState: boolean, isMobile: boolean, hasAccessToPriceList: boolean) {
        if (isMobile) {
            return this.prepareMobileDisplayedColumns(hasAccessToPriceList);
        }
        return this.prepareDesktopDisplayedColumns(priceMode, showState, hasAccessToPriceList);
    }

    private prepareDesktopDisplayedColumns(priceMode: PriceMode, showState: boolean, hasAccessToPriceList: boolean) {
        const baseDisplayedColumns = ['variantValue'];

        if (hasAccessToPriceList) {
            switch (priceMode) {
                case PriceMode.both:
                    baseDisplayedColumns.push('netPrice');
                    baseDisplayedColumns.push('grossPrice');
                    break;
                case PriceMode.total:
                    baseDisplayedColumns.push('grossPrice');
                    break;
                case PriceMode.subtotal:
                    baseDisplayedColumns.push('netPrice');
                    break;
            }
        }

        if (showState) {
            baseDisplayedColumns.push('stockLevel');
        }

        return baseDisplayedColumns.concat('quantityWithStepper', 'unit');
    }

    private prepareMobileDisplayedColumns(hasAccessToPriceList: boolean) {
        const baseDisplayedColumns = ['variantValueWithStockLevel'];

        if (hasAccessToPriceList) {
            baseDisplayedColumns.push('blockPrices');
        }

        return baseDisplayedColumns.concat('quantityWithUnit');
    }

    resetProductVariantsQuantity() {
        this._productVariantsQuantityReset.next();
    }

    updateCurrentWarehouse(warehouseId: number) {
        this._currentWarehouseChanged.next(warehouseId);
    }
}
