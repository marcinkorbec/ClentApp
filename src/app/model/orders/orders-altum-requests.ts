import { HttpClient } from '@angular/common/http';
import { b2bOrders } from 'src/integration/b2b-orders';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { OrdersRequests } from './orders-requests';

export class OrdersAltumRequests implements OrdersRequests {

    constructor(private httpClient: HttpClient) { }

    list(params: b2bOrders.ListRequest) {
        return this.httpClient.get<b2bOrders.ListResponse>('/api/orders/listAltum', { params: <any>params });
    }

    filterStates() {
        return this.httpClient.get<b2bDocuments.StateResource[]>('/api/orders/filterStates');
    }

    details(id: number) {
        return this.httpClient.get<b2bOrders.DetailsResponse>('/api/orders/detailsAltum/' + id);
    }

    confirm(id: number) {
        return this.httpClient.post<b2bDocuments.ConfirmDocumentResponse>('/api/orders/confirm/' + id, null);
    }

    remove(id: number) {
        return this.httpClient.post<boolean>('/api/orders/remove/' + id, null);
    }


}
