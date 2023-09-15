import { HttpClient } from '@angular/common/http';
import { b2bProducts } from 'src/integration/products/b2b-products';
import { ProductBaseRequests } from './product-base-requests';

export class ProductBaseAltumRequests implements ProductBaseRequests {

    constructor(private httpClient: HttpClient) { }

    requestUnits(separatedIds: string) {
        return this.httpClient.get<b2bProducts.GetUnitResponse>(`/api/items/unitsAltum?ids=${separatedIds}`);
    }
    requestUnitsById(productId: number) {
        return this.httpClient.get<b2bProducts.GetUnitResponse>(`/api/items/${productId}/unitsAltum`);
    }
}
