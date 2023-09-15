import { HttpClient, HttpResponse } from '@angular/common/http';
import { b2b } from '../../../../b2b';
import { WarehousesService } from '../../warehouses.service';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { ArrayUtils } from 'src/app/helpers/array-utils';
import { ConfigService } from '../../config.service';
import { map } from 'rxjs/operators';
import { ERPService } from '../erp/erp.service';
import { Injectable } from '@angular/core';
import { b2bShared } from 'src/integration/b2b-shared';

/**
 *  A base product object containing product features that are common to the product details, products list, and cart products
 */
@Injectable({
    providedIn: 'root'
})
export abstract class ProductBase {


    protected constructor(
        protected httpClient: HttpClient,
        public warehousesService: WarehousesService,
        protected configService: ConfigService,
        protected erpService: ERPService
    ) { }


    /**
     * Makes request for unit conversion, returns promise with converted product data
     */
    protected unitConverterRequest(item: b2b.UnitConvertRequest): Promise<HttpResponse<b2b.UnitData>> {

        const params: any = {
            id: item.id,
            unitNo: item.unitNo,
            features: item.features,
            warehouseId: item.warehouseId
        };

        return this.httpClient.get<b2b.UnitDataResponse>('/api/items/unitconverter', { params: params, observe: 'response' }).toPromise().then(res => {

            if (res.body) {
                const convertedData = this.convertProductPropertiesDifferences(res.body[0]);

                const body = Object.assign(res.body[0], convertedData);

                return res.clone({ body: body });
            }

            return res;
        }).catch(err => {
            return Promise.reject(err);
        });

    }

    protected requestUnitsForMany(ids: number[]) {
        const idsSeparatedString = ids.join('-');

        return this.erpService.context.productBase.requestUnits(idsSeparatedString);
    }

    protected requestUnitsForManyAndGroupById(ids: number[]) {

        return this.requestUnitsForMany(ids).pipe(
            map(res => {
                return ArrayUtils.groupBy(res.articleUnitList, 'articleId');
            }
        ));
    }

    /**
     * Sets given units in product with given index.
     */
    fillUnits<T>(index: number, units: b2bShared.ArticleUnitPreview[], products: T) {

        if (!products[index].units) {
            products[index].units = new Map<number, b2b.UnitMapElement>();
        }

        units.forEach(item => {

            if (!products[index].units.has(item.unitId)) {

                products[index].units.set(item.unitId, {
                    auxiliaryUnit: item.unitName
                });
            }

        });

        products[index].unitsLoaded = true;
    }

    /**
     * Fill unit map element with lazy loaded unit data
     */
    fillUnitMapElement<T>(productIndex: number, unitId: number, unitData: b2b.UnitMapElement, products: T): b2b.UnitMapElement {

        if (!products[productIndex].units.has(unitId)) {

            products[productIndex].units.set(unitId, {
                auxiliaryUnit: unitData.auxiliaryUnit || unitData.basicUnit,
            });
        }

        const unitMapElement = products[productIndex].units.get(unitId);

        products[productIndex].units.set(unitId, Object.assign(unitMapElement, unitData));

        if (unitMapElement.stockLevel !== undefined) {
            unitMapElement.max = ConvertingUtils.stringToNum(unitData.stockLevel);
        }

        if (unitMapElement.auxiliaryUnit && unitMapElement.denominator && unitId !== products[productIndex].basicUnitNo) {
            unitMapElement.converter = ConvertingUtils.unitConverterString(unitMapElement.denominator, unitMapElement.auxiliaryUnit, unitMapElement.numerator, unitMapElement.basicUnit);
        } else {
            unitMapElement.converter = null;
        }

        return Object.assign({}, unitMapElement);
    }


    protected convertProductPropertiesDifferences(dataToConvert: b2b.ProductPropertiesDifferencesToConvert): b2b.ProductPropertiesDifferencesConverted {

        const convertedData: b2b.ProductPropertiesDifferencesConverted = {
            baseGrossPrice: ConvertingUtils.stringToNum(dataToConvert.baseGrossPrice),
            baseNetPrice: ConvertingUtils.stringToNum(dataToConvert.baseNetPrice),
            netPrice: ConvertingUtils.stringToNum(dataToConvert.netPrice),
            grossPrice: ConvertingUtils.stringToNum(dataToConvert.grossPrice),
            unitLockChange: this.configService.applicationId ? dataToConvert.unitChangeBlocked : !!dataToConvert.unitLockChange
        };

        if (dataToConvert.unitGrossPrice) {
            convertedData.unitGrossPrice = ConvertingUtils.stringToNum(dataToConvert.unitGrossPrice);
        }

        if (dataToConvert.unitNetPrice) {
            convertedData.unitNetPrice = ConvertingUtils.stringToNum(dataToConvert.unitNetPrice);
        }

        return convertedData;
    }
}
