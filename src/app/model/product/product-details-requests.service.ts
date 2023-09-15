import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { Observable } from 'rxjs';
import { Config } from 'src/app/helpers/config';
import { b2bShared } from 'src/integration/b2b-shared';

@Injectable({
    providedIn: 'root'
})
export class ProductDetailsRequestsService {

    constructor(private httpClient: HttpClient) { }

    getLastOrderRequest(request: b2bProductDetails.GetLastOrderRequest): Promise<b2bProductDetails.GetLastOrderResponse> {
        return this.httpClient.get<b2bProductDetails.GetLastOrderResponse>(`/api/items/priceFromLastOrder/${request.articleId}`).toPromise();
    }

    getPlannedDeliveriesRequest(request: b2bProductDetails.GetPlannedDeliveriesRequest): Promise<b2bProductDetails.GetPlannedDeliveriesResponse> {
        return this.httpClient.get<b2bProductDetails.GetPlannedDeliveriesResponse>(`/api/items/plannedDeliveries/${request.articleId}`).toPromise();
    }

    getThresholdPriceListXlRequest(request: b2bProductDetails.GetThresholdPriceListXlRequest): Observable<b2bProductDetails.GetThresholdPriceListXlResponse> {
        const queryParams = { warehouseId: request.warehouseId, vatValue: request.vatValue, currency: request.currency };
        return this.httpClient.get<b2bProductDetails.GetThresholdPriceListXlResponse>(`/api/items/${request.articleId}/thresholdPriceListXl`, { params: <any>queryParams });
    }

    getThresholdPriceListAltumRequest(request: b2bProductDetails.GetThresholdPriceListAltumRequest): Observable<b2bProductDetails.GetThresholdPriceListAltumResponse> {
        return this.httpClient.get<b2bProductDetails.GetThresholdPriceListAltumResponse>(`/api/items/${request.articleId}/thresholdPriceListAltum`);
    }

    unitConverterXlRequest(request: b2bProductDetails.ConvertUnitsBaseRequest): Observable<b2bProductDetails.ConvertUnitsXlResponse> {
        return this.httpClient.get<b2bProductDetails.ConvertUnitsXlResponse>('/api/items/unitConverterXl', { params: <any>request });
    }

    unitConverterAltumRequest(request: b2bProductDetails.ConvertUnitsBaseRequest): Observable<b2bProductDetails.ConvertUnitsAltumResponse> {
        return this.httpClient.get<b2bProductDetails.ConvertUnitsAltumResponse>('/api/items/unitConverterAltum', { params: <any>request });
    }

    getArticlePurchaseDetailsXlRequest(request: b2bProductDetails.GetArticlePurchaseDetailsXlRequest): Observable<b2bProductDetails.GetArticlePurchaseDetailsXlResponse> {
        const queryParams = this.prepareRequestWithoutArticleId(request);
        return this.httpClient.get<b2bProductDetails.GetArticlePurchaseDetailsXlResponse>(`/api/items/${request.articleId}/getArticlePurchaseDetailsXl`, { params: <any>queryParams });
    }

    getArticlePurchaseDetailsAltumRequest(request: b2bProductDetails.GetArticlePurchaseDetailsAltumRequest): Observable<b2bProductDetails.GetArticlePurchaseDetailsAltumResponse> {
        const queryParams = this.prepareRequestWithoutArticleId(request);
        return this.httpClient.get<b2bProductDetails.GetArticlePurchaseDetailsAltumResponse>(`/api/items/${request.articleId}/getArticlePurchaseDetailsAltum`, { params: <any>queryParams });
    }


    getAttributesXlRequest(request: b2bProductDetails.GetAttributesXlRequest): Observable<b2bProductDetails.GetAttributesXlResponse> {
        return this.httpClient.get<b2bProductDetails.GetAttributesXlResponse>(`/api/items/${request.articleId}/attributesXl`);
    }

    getAttributesAltumRequest(request: b2bProductDetails.GetAttributesAltumRequest): Observable<b2bProductDetails.GetAttributesAltumResponse> {
        return this.httpClient.get<b2bProductDetails.GetAttributesAltumResponse>(`/api/items/${request.articleId}/attributesAltum`);
    }

    getArticleGeneralInfoXlRequest(request: b2bProductDetails.GetArticleGeneralInfoXlRequest): Observable<b2bProductDetails.GetArticleGeneralInfoXlResponse> {
        const queryParams = this.prepareRequestWithoutArticleId(request);
        return this.httpClient.get<b2bProductDetails.GetArticleGeneralInfoXlResponse>(`/api/items/${request.articleId}/getArticleGeneralInfoXl`, { params: <any>queryParams });
    }

    getArticleGeneralInfoAltumRequest(request: b2bProductDetails.GetArticleGeneralInfoAltumRequest): Observable<b2bProductDetails.GetArticleGeneralInfoAltumResponse> {
        const queryParams = this.prepareRequestWithoutArticleId(request);
        return this.httpClient.get<b2bProductDetails.GetArticleGeneralInfoAltumResponse>(`/api/items/${request.articleId}/getArticleGeneralInfoAltum`, { params: <any>queryParams });
    }

    getArticleDetailsXlRequest(request: b2bProductDetails.GetArticleDetailsXlRequest): Observable<b2bProductDetails.GetArticleDetailsXlResponse> {
        const queryParams = this.prepareRequestWithoutArticleId(request);
        return this.httpClient.get<b2bProductDetails.GetArticleDetailsXlResponse>(`/api/items/${request.articleId}/articleDetailsXl`, { params: <any>queryParams });
    }

    getArticleDetailsAltumRequest(request: b2bProductDetails.GetArticleDetailsAltumRequest): Observable<b2bProductDetails.GetArticleDetailsAltumResponse> {
        const queryParams = this.prepareRequestWithoutArticleId(request);
        return this.httpClient.get<b2bProductDetails.GetArticleDetailsAltumResponse>(`/api/items/${request.articleId}/articleDetailsAltum`, { params: <any>queryParams });
    }

    getArticleVariantsDetailsXlRequest(request: b2bProductDetails.GetArticleVariantsDetailsXlRequest): Observable<b2bProductDetails.GetArticleVariantsDetailsXlResponse> {
        const queryParams = this.prepareVariantsDetailsQueryParams(request.properties);
        return this.httpClient.get<b2bProductDetails.GetArticleVariantsDetailsXlResponse>(`/api/items/${request.articleId}/getArticleVariantsDetailsXl`, { params: <any>queryParams });
    }

    getArticleVariantsDetailsAltumRequest(request: b2bProductDetails.GetArticleVariantsDetailsAltumRequest): Observable<b2bProductDetails.GetArticleVariantsDetailsAltumResponse> {
        const queryParams = this.prepareVariantsDetailsQueryParams(request.properties);
        return this.httpClient.get<b2bProductDetails.GetArticleVariantsDetailsAltumResponse>(`/api/items/${request.articleId}/getArticleVariantsDetailsAltum`, { params: <any>queryParams });
    }

    private prepareRequestWithoutArticleId(request: any) {
        const queryParams = { ...request };
        delete queryParams.articleId;
        return queryParams;
    }

    private prepareVariantsDetailsQueryParams(variants: b2bShared.PropertyValuePreviewModel[]) {
        if (!variants || variants.length === 0) {
            return null;
        }

        const properties: string[] = [];

        variants.forEach(variant => {
            const property = `${Config.productVariantPropertyIdKey}-${variant.propertyId}_${Config.productVariantValueIdKey}-${variant.valueId}`;
            properties.push(property);
        });

        return { [Config.productVariantPropertiesKey]: properties };
    }
}
