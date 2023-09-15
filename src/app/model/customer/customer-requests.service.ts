import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { b2bCustomer } from 'src/integration/customer/b2b-customer';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomerRequestsService {

    constructor(private httpClient: HttpClient) { }

    getShippingAddressesXlRequest(): Observable<b2bCustomer.GetShippingAddressesXlResponse> {
        return this.httpClient.get<b2bCustomer.GetShippingAddressesXlResponse>('/api/customer/shippingAddressesXl');
    }

    updateShippingAddressXlRequest(addressId: number, request: b2bCustomer.UpdateShippingAddressXlRequest): Observable<void> {
        return this.httpClient.put<void>(`/api/customer/shippingAddressXl/${addressId}`, request);
    }

    addShippingAddressXlRequest(request: b2bCustomer.AddShippingAddressXlRequest): Observable<b2bCustomer.AddShippingAddressXlResponse> {
        return this.httpClient.post<b2bCustomer.AddShippingAddressXlResponse>('/api/customer/shippingAddressXl', request);
    }
}
