import { HttpClient } from '@angular/common/http';
import { b2bPending } from 'src/integration/b2b-pending';
import { PendingRequests } from './pending-requests';

export class PendingAltumRequests implements PendingRequests {

    constructor(private httpClient: HttpClient) { }

    list(params: b2bPending.ListRequest) {
        return this.httpClient.get<b2bPending.ListResponse>('/api/orders/pendingListAltum', { params: <any>params });
    }
}
