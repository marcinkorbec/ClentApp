import { Observable } from 'rxjs';
import { b2bProducts } from 'src/integration/products/b2b-products';

export interface ProductBaseRequests {

    requestUnits(separatedIds: string): Observable<b2bProducts.GetUnitResponse>;

    requestUnitsById(productId: number): Observable<b2bProducts.GetUnitResponse>;
}
