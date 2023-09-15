import { Observable } from "rxjs";

export interface DocumentDetailsCart {

    id: number;
    copyToCart(cartId: number): Observable<void>;
}
