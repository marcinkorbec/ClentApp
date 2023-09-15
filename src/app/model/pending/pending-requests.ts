import { Observable } from 'rxjs';
import { b2bPending } from 'src/integration/b2b-pending';

export interface PendingRequests {
    list(params: b2bPending.ListRequest): Observable<b2bPending.ListResponse>;
}
