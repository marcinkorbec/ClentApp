import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { ResourcesService } from '../resources.service';
import { b2bOrders } from 'src/integration/b2b-orders';
import { ERPService } from '../shared/erp/erp.service';
import { ConfigService } from '../config.service';
import { tap } from 'rxjs/operators';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { DocumentsList } from '../shared/documents/documents-list';

@Injectable()
export class OrdersService extends DocumentsList<b2bOrders.ListItem, b2bOrders.FilteringOptions, b2bOrders.ListResponse> {

    columns: b2bDocuments.ColumnConfig[];
    listResponseProperty = 'orderList';
    emptyListMessage: b2bDocuments.EmptyListInfo;

    constructor(
        httpClient: HttpClient,
        menuService: MenuService,
        accountService: AccountService,
        private erpService: ERPService,
        private configService: ConfigService,
        private resourceService: ResourcesService
    ) {

        super(httpClient, menuService, accountService);

        this.emptyListMessage = { resx: 'noOrders', svgId: 'Orders' };

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
            { property: 'displayedExpectedDate', translation: 'expectedDate' },
            { property: 'customer', translation: 'targetEmployee' },
            { property: 'deliveryMethod', translation: 'shippingMethod' },
            {
                property: 'completionEntirely', translation: 'completion', type: 'cases', cases: [
                    { case: 0, translation: 'partialCompletion' },
                    { case: 1, translation: 'entireCompletion' }
                ]
            },
            { property: 'currierData', translation: 'currierData' },
            {
                property: 'quotes', type: 'linkedDocumentsArray', link: {
                    hrefCreator: this.quotesHrefCreator.bind(this),
                    labelProperty: 'number'
                }
            }
        ];

    }


    protected requestList() {

        const params = Object.assign(

            this.getSharedRequestParams(),
            {
                documentNumberFilter: this.currentFilter.documentNumberFilter,
                documentOwnNumberFilter: this.currentFilter.documentOwnNumberFilter
            }
        );

        return this.erpService.context.orders.list(params);
    }


    loadList() {

        return super.loadList().pipe(tap(res => {

            this.hideDeliveryMethodsIfRequired();

            this.items.forEach(item => {
                if (item.isExpectedDateUnspecified) {
                    item.displayedExpectedDate = this.resourceService.translations.dateUnspecified;
                } else {
                    item.displayedExpectedDate = item.expectedDate.toString();
                }
            });

            return res;

        }));
    }


    /**
     * Returns default filtering options.
     * Useful for initializing list and reseting filters.
     */
    getDefaultFilteringOptions() {

        return Object.assign(

            this.getSharedDefaultFilteringOptions(),
            {
                documentNumberFilter: '',
                documentOwnNumberFilter: ''
            }
        );
    }

    requestFilteringStates() {
        return this.erpService.context.orders.filterStates();
    }

    quotesHrefCreator(quote) {
        return `/${this.menuService.routePaths.quoteDetails}/${quote.id}`;
    }

    getDocumentRouterLink(item: b2bOrders.ListItem): string[] {
        return [this.menuService.routePaths.orderDetails, item.id + ''];
    }

    private hideDeliveryMethodsIfRequired(): void {
        const deliveryColumn = this.columns.find(item => item.property === 'deliveryMethod');
        if (!this.configService.permissions.hasAccessToShowDeliveryMethod) {
            deliveryColumn.type = 'noValueSymbol';
        } else {
            deliveryColumn.type = null;
        }
    }

}
