import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { MenuService } from '../menu.service';
import { AccountService } from '../account.service';
import { SourceDocumentNumberType } from '../shared/enums/source-document-number-type.enum';
import { b2bComplaints } from 'src/integration/b2b-complaints';
import { Observable } from 'rxjs';
import { ERPService } from '../shared/erp/erp.service';
import { DocumentsList } from '../shared/documents/documents-list';

@Injectable()
export class ComplaintsService extends DocumentsList<b2bComplaints.ListItemResponse, b2bComplaints.FilteringOptions, b2bComplaints.ListResponse> {
    
    columns: b2bDocuments.ColumnConfig[];
    states: b2bDocuments.StateResource[];
    listResponseProperty: string;
    emptyListMessage: b2bDocuments.EmptyListInfo;

    constructor(httpClient: HttpClient, menuService: MenuService, accountService: AccountService, private erpService: ERPService) {

        super(httpClient, menuService, accountService);

        this.listResponseProperty = 'complaintList';
        this.emptyListMessage = { resx: 'noComplaints', svgId: 'Complaints' };

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
                property: 'statusResourceKey',
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
            { property: 'modificationDate' },
            { property: 'articlesCount', translation: 'packageArticlesCount' },
            {
                property: 'sourceDocuments', translation: 'purchaseDocument', type: 'linkedDocumentsArray', link: {
                    hrefCreator: this.hrefCreator.bind(this),
                    labelProperty: 'number'
                }
            },
        ];

    }

    hrefCreator(document: b2bDocuments.PaymentReference) {
        switch (document.type) {
            case SourceDocumentNumberType.FS:
            case SourceDocumentNumberType.PA:
                return `${this.menuService.routePaths.paymentDetails}/${document.id}/${document.type}`;
            default:
                return null;
        }
    }


    protected requestFilteringStates(): Observable<b2bDocuments.StateResource[]> {
        return this.erpService.context.complaints.filterStates();
    }
    
    getDocumentRouterLink(item: b2bComplaints.ListItemResponse): string[] {
        return [this.menuService.routePaths.complaintDetails, item.id + ''];
    }
    protected getDefaultFilteringOptions(): b2bComplaints.FilteringOptions {

        return Object.assign(
            this.getSharedDefaultFilteringOptions(),
            {
                documentNumberFilter: '',
                documentOwnNumberFilter: ''
            }
        );
    }
    protected requestList(): Observable<b2bComplaints.ListResponse> {

        const params = Object.assign(

            this.getSharedRequestParams(),
            {
                documentNumberFilter: this.currentFilter.documentNumberFilter,
                documentOwnNumberFilter: this.currentFilter.documentOwnNumberFilter,
            }
        );

        return this.erpService.context.complaints.list(params);
    }
}
