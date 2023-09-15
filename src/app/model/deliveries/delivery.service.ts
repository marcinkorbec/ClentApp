import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { b2bDelivery } from 'src/integration/b2b-delivery';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { DocumentsList } from '../shared/documents/documents-list';
import { ERPService } from '../shared/erp/erp.service';

@Injectable()
export class DeliveryService extends DocumentsList<b2bDelivery.ListItemResponse, b2bDelivery.FilteringOptions, b2bDelivery.ListResponse> {
    
    columns: b2bDocuments.ColumnConfig[];
    states: b2bDocuments.StateResource[];
    listResponseProperty: string;
    emptyListMessage: b2bDocuments.EmptyListInfo;

    constructor(httpClient: HttpClient, menuService: MenuService, accountService: AccountService, private erpService: ERPService) {
        super(httpClient, menuService, accountService);

        this.listResponseProperty = 'deliveryList';
        this.emptyListMessage = { resx: 'noDelivery', svgId: 'Delivery' };

        this.columns = [
            {
                property: 'number',
                filter: { property: 'filter', type: 'text' }
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
                    defaultValue: this.defaultState
                }
            },
            { property: 'createdDate' },
            { property: 'articlesCount', translation: 'packageArticlesCount' },
            { property: 'deliveryAddress', translation: 'shippingAddress' },
            { property: 'waybill' }
        ];

        
    }

    protected requestList() {

        const params = Object.assign(
            this.getSharedRequestParams(),
            { filter: this.currentFilter.filter }
        );

        return this.erpService.context.delivery.list(params);
    }

    protected requestFilteringStates(): Observable<b2bDocuments.StateResource[]> {
        return this.erpService.context.delivery.filterStates();
    }
    
    getDocumentRouterLink(item: b2bDelivery.ListItemResponse): string[] {
        return [this.menuService.routePaths.deliveryDetails, item.id + ''];
    }
    
    protected getDefaultFilteringOptions(): b2bDelivery.FilteringOptions {

        return Object.assign(
            this.getSharedDefaultFilteringOptions(),
            {
                filter: ''
            }
        );
    }


}
