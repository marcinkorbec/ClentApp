import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { b2bQuotes } from 'src/integration/b2b-quotes';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { DocumentsList } from '../shared/documents/documents-list';
import { ERPService } from '../shared/erp/erp.service';

@Injectable()
export class QuotesService extends DocumentsList<b2bQuotes.ListItemResponse, b2bQuotes.FilteringOptions, b2bQuotes.ListResponse> {

    listResponseProperty: string;
    columns: b2bDocuments.ColumnConfig[];
    states: b2bDocuments.StateResource[];
    emptyListMessage: b2bDocuments.EmptyListInfo;

    constructor(httpClient: HttpClient, menuService: MenuService, accountService: AccountService, private erpService: ERPService) {

        super(httpClient, menuService, accountService);

        this.listResponseProperty = 'quoteList';
        this.emptyListMessage = { resx: 'noQuotes', svgId: 'Quotes' };

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
                translation: 'state',
                type: 'translation',
                filter: {
                    property: 'stateId',
                    type: 'select',
                    valuesProperty: 'states',
                    valuesLoader: this.loadStates.bind(this),
                    defaultValue: this.defaultState
                }
            },
            { property: 'issueDate' },
            { property: 'expirationDate' },
            {
                translation: 'fromInquiry', type: 'linkedDocument', link: {
                    hrefCreator: this.inquiryHrefCreator.bind(this),
                    labelProperty: 'inquiryNumber'
                }
            },
            {
                property: 'orders', type: 'linkedDocumentsArray', link: {
                    hrefCreator: this.ordersHrefCreator.bind(this),
                    labelProperty: 'number'

                }
            }

        ];

    }


    getDefaultFilteringOptions() {

        return Object.assign(

            this.getSharedDefaultFilteringOptions(),
            {
                valid: true,
                documentNumberFilter: '',
                documentOwnNumberFilter: ''
            }
        );
    }

    inquiryHrefCreator(item) {
        return `/${this.menuService.routePaths.inquiryDetails}/${item.inquiryId}`;
    }

    ordersHrefCreator(order) {
        return `/${this.menuService.routePaths.orderDetails}/${order.id}`;
    }

    protected requestFilteringStates(): Observable<b2bDocuments.StateResource[]> {
        return this.erpService.context.quotes.filterStates();
    }

    getDocumentRouterLink(item: b2bQuotes.ListItemResponse): string[] {
        return [this.menuService.routePaths.quoteDetails, item.id + ''];
    }

    protected requestList() {

        const params = Object.assign(

            this.getSharedRequestParams(),
            {
                documentNumberFilter: this.currentFilter.documentNumberFilter,
                documentOwnNumberFilter: this.currentFilter.documentOwnNumberFilter,
                valid: this.currentFilter.valid
            }
        );

        return this.erpService.context.quotes.list(params);
    }

}
