import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { b2bDelivery } from 'src/integration/b2b-delivery';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export class DeliveryXlRequests {

    constructor(private httpClient: HttpClient) {}

    list(params: b2bDelivery.ListRequest): Observable<b2bDelivery.ListResponse> {
       return this.httpClient.get<b2bDelivery.ListResponse>('/api/delivery/listXl', {params: <any>params});
    }

    filterStates(): Observable<b2bDocuments.StateResource[]> {
        return this.httpClient.get<b2bDocuments.StateResource[]>('/api/delivery/filterStates');
    }

    details(id: number, pageNumber: Number): Observable<b2bDelivery.DetailsResponse> {
        const params = {
            id: id,
            pageNumber: pageNumber
        };
        return this.httpClient.get<b2bDelivery.DetailsResponse>('/api/delivery/detailsXl/', {params: <any>params});
    }
}
