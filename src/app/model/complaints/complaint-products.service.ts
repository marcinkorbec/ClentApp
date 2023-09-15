import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { DateHelper } from 'src/app/helpers/date-helper';
import { b2bComplaintItems } from 'src/integration/b2b-complaint-items';
import { b2bComplaints } from 'src/integration/b2b-complaints';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { ItemsList } from '../shared/documents/items-list';
import { SourceDocumentNumberType } from '../shared/enums/source-document-number-type.enum';
import { ERPService } from '../shared/erp/erp.service';

@Injectable()
export class ComplaintProductsService extends ItemsList<b2bComplaintItems.ListItemResponse, b2bComplaintItems.FilteringOptions, b2bComplaintItems.ListResponse> {

    listResponseProperty: string;
    summary: b2bComplaintItems.Summary;
    columns: b2bDocuments.ColumnConfig[];
    states: b2bDocuments.StateResource[];
    loadedDocumentsDateRange: [Date, Date];
    documentsLoading: boolean;
    documents: b2bDocuments.DocumentReference[];
    defaultDocumentId = 0;
    emptyListMessage: b2bDocuments.EmptyListInfo;

    constructor(
        httpClient: HttpClient,
        menuService: MenuService,
        accountService: AccountService,
        private erpService: ERPService
    ) {
        super(httpClient, menuService, accountService);

        this.currentFilter = Object.assign(this.currentFilter, this.getDefaultFilteringOptions());

        this.listResponseProperty = 'articlesToComplaint';
        this.emptyListMessage = { resx: 'noComplaintProducts', svgId: 'ComplaintProducts' };

        this.loadedDocumentsDateRange = [this.currentFilter.dateFrom, this.currentFilter.dateTo];

        this.columns = [
            {
                property: 'complain',
                translation: ' ',
                type: 'complain',
                mobileVisibleColumn: true,
                mobileHiddenHeader: true
            },
            {
                property: 'name',
                type: 'productName',
                mobileVisibleColumn: true,
                filter: { property: 'filter', type: 'text' }
            },
            {
                property: 'sourceDocumentId',
                translation: 'purchaseDocument',
                type: 'linkedDocument',
                mobileVisibleColumn: true,
                mobileHiddenHeader: true,
                link: {
                    hrefCreator: this.hrefCreator.bind(this),
                    labelProperty: 'sourceDocumentName'
                },
                filter: {
                    property: 'documentId',
                    type: 'select',
                    valuesProperty: 'documents',
                    valuesLoader: this.loadDocuments.bind(this),
                    defaultValue: 0
                }
            },
            { property: 'quantity', type: 'quantity', mobileVisibleColumn: true }
        ];

        this.accountService.logOutSubj.subscribe(() => {
            this.clearComplaintData();
        });
    }

    private documentsRequest(): Observable<b2bDocuments.DocumentReference[]> {
        const params = {
            filter: this.currentFilter.filter || '',
            dateFrom: DateHelper.dateToString(this.currentFilter.dateFrom),
            dateTo: DateHelper.dateToString(this.currentFilter.dateTo)
        };

        return this.erpService.context.complaints.complaintItemsPurchaseDocuments(params);
    }

    loadDocuments(): Observable<b2bDocuments.DocumentReference[]> {

        this.documentsLoading = true;

        if (this.documents
            && DateHelper.difference(this.loadedDocumentsDateRange[0], this.currentFilter.dateFrom, 'days') === 0
            && DateHelper.difference(this.loadedDocumentsDateRange[1], this.currentFilter.dateTo, 'days') === 0) {

            this.documentsLoading = false;
            return of(this.documents);

        }

        this.loadedDocumentsDateRange = [this.currentFilter.dateFrom, this.currentFilter.dateTo];

        return this.documentsRequest().pipe(tap(res => {
            this.documents = res;
            this.documentsLoading = false;
            return res;
        }));
    }

    hrefCreator(item: b2bComplaints.ComplaintItem) {
        switch (item.sourceDocumentType) {
            case SourceDocumentNumberType.FS:
            case SourceDocumentNumberType.PA:
                return `${this.menuService.routePaths.paymentDetails}/${item.sourceDocumentId}/${item.sourceDocumentType}`;
            default:
                return null;
        }
    }

    private clearComplaintData() {
        if (this.documents) {
            this.documents = undefined;
        }
    }

    getDocumentRouterLink(item: b2bComplaintItems.ListItemResponse): string[] {
        return [this.menuService.routePaths.itemDetails, item.itemId + ''];
    }

    protected getDefaultFilteringOptions(): b2bComplaintItems.FilteringOptions {

        return Object.assign(

            super.getSharedDefaultFilteringOptions(),
            {
                documentId: this.defaultDocumentId,
                filter: ''
            }
        );
    }

    protected requestList(): Observable<b2bComplaintItems.ListResponse> {

        const params = Object.assign(
            this.getSharedRequestParams(),
            {
                documentId: this.currentFilter.documentId,
                filter: this.currentFilter.filter || ''
            }
        );


        if (DateHelper.difference(this.loadedDocumentsDateRange[0], this.currentFilter.dateFrom, 'days') === 0
            && DateHelper.difference(this.loadedDocumentsDateRange[1], this.currentFilter.dateTo, 'days') === 0) {

            return this.erpService.context.complaints.complaintItemsList(params);
        }


        return this.loadDocuments().pipe(switchMap(() => {

            const isDocumentExist = this.documents.find(el => el.id === Number(this.currentFilter.documentId));

            if (!isDocumentExist) {
                this.currentFilter.documentId = 0;
                params.documentId = 0;
            }

            return this.erpService.context.complaints.complaintItemsList(params);
        }));

    }

    loadList() {

        return super.loadList().pipe(tap(res => {
            this.summary = res.summary;
            this.gridTemplateColumnsDesktop = `140px 2fr repeat(${this.columns.length - 2}, 1fr)`;
        }));
    }
}
