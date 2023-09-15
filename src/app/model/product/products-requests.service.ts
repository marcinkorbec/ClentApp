import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { b2bProducts } from 'src/integration/products/b2b-products';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductsRequestsService {

    constructor(private httpClient: HttpClient) { }

    getSuggestionsXlRequest(request: b2bProducts.GetSuggestionsXlRequest): Observable<b2bProducts.GetSuggestionsXlResponse> {
        return this.httpClient.get<b2bProducts.GetSuggestionsXlResponse>('/api/items/suggestionsXl', { params: <any>request });
    }

    getSuggestionsAltumRequest(request: b2bProducts.GetSuggestionsAltumRequest): Observable<b2bProducts.GetSuggestionsAltumResponse> {
        return this.httpClient.get<b2bProducts.GetSuggestionsAltumResponse>('/api/items/suggestionsAltum', { params: <any>request });
    }

    getArticleListXlRequest(request: b2bProducts.GetArticleListBaseRequest): Promise<b2bProducts.GetArticleListXlResponse> {
        return this.httpClient.get<b2bProducts.GetArticleListXlResponse>('/api/items/articleListXl/', { params: <any>request }).toPromise();
    }

    getArticleListAltumRequest(request: b2bProducts.GetArticleListBaseRequest): Promise<b2bProducts.GetArticleListAltumResponse> {
        return this.httpClient.get<b2bProducts.GetArticleListAltumResponse>('/api/items/articleListAltum/', { params: <any>request }).toPromise();
    }

    getArticleFromListXlRequest(request: b2bProducts.GetArticleFromListBaseRequest): Promise<b2bProducts.GetArticleFromListXlResponse> {
        return this.httpClient.get<b2bProducts.GetArticleFromListXlResponse>('/api/items/articleFromListXl/', { params: <any>request }).toPromise();
    }

    getArticleFromListAltumRequest(request: b2bProducts.GetArticleFromListBaseRequest): Promise<b2bProducts.GetArticleFromListAltumResponse> {
        return this.httpClient.get<b2bProducts.GetArticleFromListAltumResponse>('/api/items/articleFromListAltum/', { params: <any>request }).toPromise();
    }

    getArticleGroupFiltersXlRequest(request: b2bProducts.GetArticleGroupFiltersXlRequest): Observable<b2bProducts.GetArticleGroupFiltersXlResponse> {
        return this.httpClient.get<b2bProducts.GetArticleGroupFiltersXlResponse>('/api/items/getFiltersPerArticleGroupXl', { params: <any>request });
    }

    getArticleGroupFiltersAltumRequest(request: b2bProducts.GetArticleGroupFiltersAltumRequest): Observable<b2bProducts.GetArticleGroupFiltersAltumResponse> {
        return this.httpClient.get<b2bProducts.GetArticleGroupFiltersAltumResponse>('/api/items/getFiltersPerArticleGroupAltum', { params: <any>request });
    }

    getArticleListWithGroupFiltersXlRequest(request: b2bProducts.GetArticleListWithGroupFiltersXlRequest): Promise<b2bProducts.GetArticleListXlResponse> {
        return this.httpClient.post<b2bProducts.GetArticleListXlResponse>('/api/items/filterPerArticleGroupXl', request).toPromise();
    }

    getArticleListWithGroupFiltersAltumRequest(request: b2bProducts.GetArticleListWithGroupFiltersAltumRequest): Promise<b2bProducts.GetArticleListAltumResponse> {
        return this.httpClient.post<b2bProducts.GetArticleListAltumResponse>('/api/items/filterPerArticleGroupAltum', request).toPromise();
    }

    getFilterSetsXlRequest(request: b2bProducts.GetFilterSetsXlRequest): Observable<b2bProducts.GetFilterSetsXlResponse> {
        return this.httpClient.get<b2bProducts.GetFilterSetsXlResponse>('/api/items/filterSetXl', { params: <any>request });
    }

    getFilterSetsAltumRequest(request: b2bProducts.GetFilterSetsAltumRequest): Observable<b2bProducts.GetFilterSetsAltumResponse> {
        return this.httpClient.get<b2bProducts.GetFilterSetsAltumResponse>('/api/items/filterSetAltum', { params: <any>request });
    }

    deleteFilterSetXlRequest(request: b2bProducts.DeleteFilterSetXlRequest): Observable<void> {
        return this.httpClient.delete<void>(`/api/items/filterSetXl/${request.filterSetId}`);
    }

    deleteFilterSetAltumRequest(request: b2bProducts.DeleteFilterSetAltumRequest): Observable<void> {
        return this.httpClient.delete<void>(`/api/items/filterSetAltum/${request.filterSetId}`);
    }

    addFilterSetXlRequest(request: b2bProducts.AddFilterSetXlRequest): Observable<b2bProducts.AddFilterSetXlResponse> {
        return this.httpClient.post<b2bProducts.AddFilterSetXlResponse>('/api/items/filterSetXl', request);
    }

    addFilterSetAltumRequest(request: b2bProducts.AddFilterSetAltumRequest): Observable<b2bProducts.AddFilterSetAltumResponse> {
        return this.httpClient.post<b2bProducts.AddFilterSetAltumResponse>('/api/items/filterSetAltum', request);
    }

    updateFilterSetNameXlRequest(request: b2bProducts.UpdateFilterSetNameXlRequest): Observable<void> {
        return this.httpClient.put<void>(`/api/items/filterSetNameXl/${request.filterSetId}`, { newFilterSetName: request.newFilterSetName });
    }

    updateFilterSetNameAltumRequest(request: b2bProducts.UpdateFilterSetNameAltumRequest): Observable<void> {
        return this.httpClient.put<void>(`/api/items/filterSetNameAltum/${request.filterSetId}`, { newFilterSetName: request.newFilterSetName });
    }
}
