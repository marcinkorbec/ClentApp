import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { b2bInquiries } from 'src/integration/b2b-inquiries';
import { Observable } from 'rxjs';
import { ERPService } from '../shared/erp/erp.service';
import { DocumentsList } from '../shared/documents/documents-list';

@Injectable()
export class InquiriesService extends DocumentsList<b2bInquiries.ListItemResponse, b2bInquiries.FilteringOptions, b2bInquiries.ListResponse> {
    
    listResponseProperty: string;
    emptyListMessage: b2bDocuments.EmptyListInfo;
    columns: b2bDocuments.ColumnConfig[];

    constructor(
        httpClient: HttpClient,
        accountService: AccountService,
        menuService: MenuService,
        private erpService: ERPService
    ) {

        super(httpClient, menuService, accountService);

        this.listResponseProperty = 'inquiryList';
        this.emptyListMessage = { resx: 'noInquiries', svgId: 'Inquiries' };

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
                    defaultValue: -1
                }
            },
            { property: 'issueDate' },
            { property: 'description' },
        ];
    }

    protected requestFilteringStates(): Observable<b2bDocuments.StateResource[]> {
        return this.erpService.context.inquiries.filterStates();
    }
    
    getDocumentRouterLink(item: b2bInquiries.ListItemResponse): string[] {
        return [this.menuService.routePaths.inquiryDetails, item.id + ''];
    }

    protected getDefaultFilteringOptions() {
        return Object.assign(
            this.getSharedDefaultFilteringOptions(),
            {
                documentNumberFilter: '',
                documentOwnNumberFilter: ''
            }
        );
    }

    protected requestList() {

        const params = Object.assign(

            this.getSharedRequestParams(),
            {
                documentNumberFilter: this.currentFilter.documentNumberFilter,
                documentOwnNumberFilter: this.currentFilter.documentOwnNumberFilter
            }
        );

        return this.erpService.context.inquiries.list(params);
    }
}
