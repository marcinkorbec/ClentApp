import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { b2bCustomerFiles } from 'src/integration/b2b-customer-files';

export class CustomerFilesRequests {

    constructor(private httpClient: HttpClient) {}

    list(params: b2bCustomerFiles.ListRequest): Observable<b2bCustomerFiles.ListResponseUnified> {
        return this.httpClient.get<b2bCustomerFiles.ListResponse>('/api/files/getFilesByCustomer', { params: <any>params }).pipe(map(res => {
            return {
                customerFiles: res
            };
        }));
    }

}
