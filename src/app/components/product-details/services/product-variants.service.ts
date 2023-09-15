import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { OptionBaseStatus } from 'src/app/model/shared/enums/option-base-status.enum';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { b2bShared } from 'src/integration/b2b-shared';

@Injectable()
export class ProductsVariantsService {

    private _variantsSummaryChanged: Subject<b2bProductDetails.ProductVariantsSummary>;
    variantsSummaryChanged$: Observable<b2bProductDetails.ProductVariantsSummary>;

    private _purchaseDetailsChanged: Subject<b2bProductDetails.ProductPurchaseDetailsSummary>;
    purchaseDetailsChanged$: Observable<b2bProductDetails.ProductPurchaseDetailsSummary>;

    private _productVariantsQuantityReset: Subject<void>;
    productVariantsQuantityReset$: Observable<void>;

    private _currentWarehouseChanged: Subject<number>;
    currentWarehouseChanged$: Observable<number>;

    constructor() {
        this._variantsSummaryChanged = new Subject();
        this.variantsSummaryChanged$ = this._variantsSummaryChanged.asObservable();

        this._purchaseDetailsChanged = new Subject();
        this.purchaseDetailsChanged$ = this._purchaseDetailsChanged.asObservable();

        this._productVariantsQuantityReset = new Subject();
        this.productVariantsQuantityReset$ = this._productVariantsQuantityReset.asObservable();

        this._currentWarehouseChanged = new Subject();
        this.currentWarehouseChanged$ = this._currentWarehouseChanged.asObservable();
    }

    changeVariantsSummary(summary: b2bProductDetails.ProductVariantsSummary) {
        this._variantsSummaryChanged.next(summary);
    }

    prepareSwitchControlModels(variants: b2bProductDetails.ProductVariant[]): b2bShared.SwitchControlModel[] {
        const switchModels = [];

        variants?.forEach(variant => {
            const model = this.prepareSwitchControlModel(variant);
            switchModels.push(model);
        });

        return switchModels;
    }

    private prepareSwitchControlModel(variant: b2bProductDetails.ProductVariant): b2bShared.SwitchControlModel {
        const values: b2bShared.OptionBase[] = [];
        variant?.values?.forEach(variantValue => {
            const value = this.prepareOptionBase(variantValue.valueId, variantValue.translatedName, variantValue.status);
            values.push(value);
        });
        return {
            id: variant?.header?.propertyId,
            translatedHeader: variant?.header?.translatedName,
            values,
        };
    }

    private prepareOptionBase(id: number, translatedName: string, status: OptionBaseStatus): b2bShared.OptionBase {
        return { id, translatedName, status };
    }

    prepareSelectedSwitchModels(switchControlModels: b2bShared.SwitchControlModel[], changedModel: b2bShared.PropertyValuePreviewModel): b2bShared.PropertyValuePreviewModel[] {
        const models = [];

        switchControlModels?.forEach(switchModel => {
            if (switchModel.id === changedModel?.propertyId) {
                models.push(changedModel);
                return;
            }

            const checkedValue = switchModel?.values?.find(value => value.status === OptionBaseStatus.Checked);
            if (checkedValue) {
                const model = this.preparePropertyValuePreviewModel(switchModel.id, checkedValue?.id);
                models.push(model);
            }
        });

        return models;
    }

    private preparePropertyValuePreviewModel(propertyId: number, valueId: number): b2bShared.PropertyValuePreviewModel {
        return { propertyId, valueId };
    }

    updatePurchaseDetails(summary: b2bProductDetails.ProductPurchaseDetailsSummary) {
        this._purchaseDetailsChanged.next(summary);
    }

    resetProductVariantsQuantity() {
        this._productVariantsQuantityReset.next();
    }

    updateCurrentWarehouse(warehouseId: number) {
        this._currentWarehouseChanged.next(warehouseId);
    }
}
