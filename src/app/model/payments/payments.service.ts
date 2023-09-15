import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { b2bPayments } from 'src/integration/b2b-payments';
import { b2bCommon } from 'src/integration/shared/b2b-common';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { DocumentsList } from '../shared/documents/documents-list';
import { ERPService } from '../shared/erp/erp.service';
import { PaymentType } from './payment-type.enum';

@Injectable()
export class PaymentsService extends DocumentsList<b2bPayments.ListItemResponse, b2bPayments.FilteringOptions, b2bPayments.ListResponse> {

    
    listResponseProperty: string;

    columns: b2bDocuments.ColumnConfig[];
    states: b2bDocuments.StateResource[];
    summaries: b2bPayments.ListSummary[];
    currencies: b2bCommon.Option[];
    defaultCurrencyId: number;
    defaultPaymentTypeId: PaymentType;
    emptyListMessage: b2bDocuments.EmptyListInfo;

    constructor(httpClient: HttpClient, menuService: MenuService, accountService: AccountService, private erpService: ERPService) {

        super(httpClient, menuService, accountService);

        this.listResponseProperty = 'paymentList';
        this.defaultCurrencyId = 0;
        this.defaultPaymentTypeId = PaymentType.payables;
        this.currentFilter = Object.assign(this.currentFilter, this.getDefaultFilteringOptions());
        this.emptyListMessage = { resx: 'noPayments', svgId: 'Payments' };
        
        this.columns = [
            {
                property: 'number',
                filter: { property: 'documentNumberFilter', type: 'text' }
            },
            {
                property: 'sourceNumber',
                translation: 'myNumber',
                filter: { property: 'documentOwnNumberFilter', type: 'text' }
            },
            {
                property: 'stateResourceKey',
                type: 'translation',
                translation: 'state',
                filter: {
                    property: 'stateId',
                    type: 'select',
                    valuesProperty: 'states',
                    defaultValue: this.defaultState,
                    valuesLoader: this.loadStates.bind(this)
                }
            },
            { property: 'issueDate' },
            { property: 'daysAfterDueDate', translation: 'dueDate', type: 'daysAfterDueDate' },
            { property: 'paymentForm' },
            { property: 'amount', type: 'price' },
            { property: 'remaining', type: 'price' },
            {
                property: 'currency',
                filter: {
                    property: 'currencyId',
                    type: 'select',
                    valuesLoader: this.loadCurrency.bind(this),
                    valuesProperty: 'currencies',
                    defaultValue: this.defaultCurrencyId + ''
                }
            }
        ];

    }

    private requestCurrency() {
        return this.erpService.context.payments.currencies();
    }

    loadCurrency() {
        if (this.currencies) {
            return;
        }

        return this.requestCurrency().pipe(tap(res => {
            this.currencies = res;
        }));
    }

    loadList() {
        return super.loadList().pipe(tap(res => {
            this.summaries = res.paymentListSummary;
            return res;
        }));
    }

    protected requestFilteringStates(): Observable<b2bDocuments.StateResource[]> {
        return this.erpService.context.payments.filterStates();
    }

    getDocumentRouterLink(item: b2bPayments.ListItemResponse): string[] {
        return [this.menuService.routePaths.paymentDetails, item.id + '', item.type + ''];
    }

    protected getDefaultFilteringOptions(): b2bPayments.FilteringOptions {

        return Object.assign(

            this.getSharedDefaultFilteringOptions(),
            {
                currencyId: 0,
                currencyName: '',
                paymentTypeId: this.defaultPaymentTypeId,
                documentNumberFilter: '',
                documentOwnNumberFilter: ''
            }
        );
    }
    protected requestList(): Observable<b2bPayments.ListResponse> {
        
        
        const params = Object.assign(

            this.getSharedRequestParams(),
            {
                documentNumberFilter: this.currentFilter.documentNumberFilter,
                documentOwnNumberFilter: this.currentFilter.documentOwnNumberFilter,
                currencyId: this.currentFilter.currencyId,
                currencyName: this.currentFilter.currencyName,
                paymentTypeId: this.currentFilter.paymentTypeId
            }
        );

        return this.erpService.context.payments.list(params);

    }

}
