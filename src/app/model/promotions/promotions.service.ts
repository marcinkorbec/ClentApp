import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from '../account.service';
import { ERPService } from '../shared/erp/erp.service';
import { tap } from 'rxjs/operators';
import { b2bPromotions } from 'src/integration/b2b-promotions';



@Injectable()
export class PromotionsService {

    items: b2bPromotions.ListItem[];
    logoutSub: Subscription;

    constructor(
        private accountService: AccountService,
        private erpService: ERPService
    ) {

        this.logoutSub = this.accountService.logOutSubj.subscribe(() => {
            this.items = undefined;
        });
    }


    protected requestList() {
        return this.erpService.context.promotions.list();
    }

    loadList() {

        return this.requestList().pipe(tap(res => {
            this.items = res.promotionList;
            return res;
        }));
    }
}

