import { Observable } from 'rxjs';
import { b2bPromotions } from 'src/integration/b2b-promotions';

export interface PromotionsRequests {
    
    list(): Observable<b2bPromotions.ListResponse>;

    details(id: number, pageNumber: number): Observable<b2bPromotions.DetailsResponseUnified>;
}
