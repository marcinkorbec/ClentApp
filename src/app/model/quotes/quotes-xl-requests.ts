import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { b2bQuotes } from 'src/integration/b2b-quotes';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { QuotesRequests } from './quotes-requests';

export class QuotesXlRequests implements QuotesRequests {

    constructor(private httpClient: HttpClient) {}

    list(params: b2bQuotes.ListRequest) {
        return this.httpClient.get<b2bQuotes.ListResponse>('/api/quotes/listXl', {params: <any>params});
    }

    filterStates(): Observable<b2bDocuments.StateResource[]> {
        return this.httpClient.get<b2bDocuments.StateResource[]>('/api/quotes/filterStates');
    }

    details(id: number): Observable<b2bQuotes.DetailsResponse> {
        return this.httpClient.get<b2bQuotes.DetailsResponse>('/api/quotes/detailsXl/' + id);
    }

    addToCartFromQuoteRequest(request: b2bQuotes.AddToCartFromQuoteRequest): Observable<b2bQuotes.AddToCartFromQuoteResponse> {
        return this.httpClient.post<b2bQuotes.AddToCartFromQuoteResponse>('/api/quotes/addCartFromQuote', request);
    }

}
