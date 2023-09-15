import { Observable } from 'rxjs';
import { b2bOrders } from 'src/integration/b2b-orders';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export interface OrdersRequests {

    list(params: b2bOrders.ListRequest): Observable<b2bOrders.ListResponse>;

    filterStates(): Observable<b2bDocuments.StateResource[]>;

    details(id: number): Observable<b2bOrders.DetailsResponse>;

    confirm(id: number): Observable<b2bDocuments.ConfirmDocumentResponse>;

    remove(id: number): Observable<boolean>;
}
