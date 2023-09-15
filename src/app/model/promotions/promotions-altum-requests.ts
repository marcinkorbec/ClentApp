import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { b2bPromotions } from 'src/integration/b2b-promotions';
import { PromotionType } from '../enums/promotion-type.enum';
import { PromotionsRequests } from './promotions-requests';

export class PromotionsAltumRequests implements PromotionsRequests {

    constructor(private httpClient: HttpClient) {}

    list(): Observable<b2bPromotions.ListResponse> {
        
        return this.httpClient.get<b2bPromotions.ListResponseAltum>('/api/Promotions/listAltum').pipe(tap(res => {
            
            res.promotionList.forEach(promo => {
                let newType = 0;

                if (promo.type === 7 || promo.type === 9) {
                    newType = PromotionType.PLT;
                } else {
                    newType = PromotionType.PRM;
                }

                promo.type = newType;

                if (promo.effectiveFrom) {
                    const effectiveFromArray = (promo.effectiveFrom as string).split(' ');
                    const effectiveFromDateArray = effectiveFromArray[0].split('.');
                    let effectiveFromProperDate = effectiveFromDateArray.reverse().join('-');

                    if (effectiveFromArray[1]) {
                        effectiveFromProperDate += ('T' + effectiveFromArray[1]);
                    }

                    promo.effectiveFrom = effectiveFromProperDate;
                }

                if (promo.until) {
                    const untillArray = (promo.until as string).split(' ');
                    const untillArrayDateArray = untillArray[0].split('.');
                    let untilProperDate = untillArrayDateArray.reverse().join('-');

                    if (untillArrayDateArray[1]) {
                        untilProperDate += ('T' + untillArrayDateArray[1]);
                    }

                    promo.until = untilProperDate;
                }

            });

            return res;
        }));
    }

    details(id: number, pageNumber: number): Observable<b2bPromotions.DetailsResponseUnified> {

        const params = {pageNumber};

        return this.httpClient.get<b2bPromotions.DetailsResponseAltum>('/api/Promotions/detailsAltum/' + id, {params: <any>params});
    }
}
