import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { b2bPending } from 'src/integration/b2b-pending';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { ItemsList } from '../shared/documents/items-list';
import { ERPService } from '../shared/erp/erp.service';

@Injectable()
export class PendingService extends ItemsList<b2bPending.ListItemResponse, b2bPending.FilteringOptions, b2bPending.ListResponse> {
    
    summary: b2bPending.PendingListSummary;
    columns: b2bDocuments.ColumnConfig[];
    listResponseProperty: string;
    emptyListMessage: b2bDocuments.EmptyListInfo;

    constructor(
        httpClient: HttpClient,
        accountService: AccountService,
        menuService: MenuService,
        private erpService: ERPService
    ) {
        super(httpClient, menuService, accountService);

        this.listResponseProperty = 'pendingList';
        this.emptyListMessage = { resx: 'noPending', svgId: 'Pending' };

        this.columns = [
            {
                property: 'name',
                type: 'productName',
                translation: 'article',
                mobileVisibleColumn: true,
                filter: { property: 'articleNameFilter', type: 'text' }
            },
            {
                property: 'number',
                filter: { property: 'documentNumberFilter', type: 'text' },
                mobileVisibleColumn: true
            },
            {
                property: 'sourceNumber',
                translation: 'myNumber',
                filter: { property: 'documentOwnNumberFilter', type: 'text' },
                mobileVisibleColumn: true
            },
            { property: 'issueDate' },
            { property: 'orderedQuantity' },
            { property: 'completedQuantity' },
            { property: 'quantityToComplete' },
            { property: 'basicUnit', translation: '', type: 'unit' },
            { property: 'expectedDate' }
        ];
    }

    loadList() {
        return super.loadList().pipe(tap(res => {

            this.summary = res.pendingListSummary;
            this.gridTemplateColumnsDesktop = `3fr repeat(${this.columns.length - 1}, 1fr)`;
            this.gridTemplateColumnsMobile = `1fr 1fr 1fr`;
            return res;
        }));
    }

    convertReceivedFilters() {

    }

    getDocumentRouterLink(item: b2bPending.ListItemResponse): string[] {
        return [this.menuService.routePaths.itemDetails, item.itemId + ''];
    }

    protected getDefaultFilteringOptions(): b2bPending.FilteringOptions {

        return Object.assign(
            super.getSharedDefaultFilteringOptions(),
            {
                articleNameFilter: '',
                documentNumberFilter: '',
                documentOwnNumberFilter: ''
            }
        );
    }

    protected requestList() {

        const params = Object.assign(
            this.getSharedRequestParams(),
            {
                articleNameFilter: this.currentFilter.articleNameFilter,
                documentNumberFilter: this.currentFilter.documentNumberFilter,
                documentOwnNumberFilter: this.currentFilter.documentOwnNumberFilter
            }
        );

        return this.erpService.context.pending.list(params);
    }

}
