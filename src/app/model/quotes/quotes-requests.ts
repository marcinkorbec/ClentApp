import { Observable } from 'rxjs';
import { b2bQuotes } from 'src/integration/b2b-quotes';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export interface QuotesRequests {

    list(params: b2bQuotes.ListRequest): Observable<b2bQuotes.ListResponse>;

    filterStates(): Observable<b2bDocuments.StateResource[]>;

    details(id: number): Observable<b2bQuotes.DetailsResponse>;

    addToCartFromQuoteRequest(request: b2bQuotes.AddToCartFromQuoteRequest): Observable<b2bQuotes.AddToCartFromQuoteResponse>;
}
