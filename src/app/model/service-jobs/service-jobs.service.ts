import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { b2bServiceJobs } from 'src/integration/b2b-service-jobs';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { MenuService } from '../menu.service';
import { AccountService } from '../account.service';
import { HttpClient } from '@angular/common/http';
import { b2bCommon } from 'src/integration/shared/b2b-common';
import { ERPService } from '../shared/erp/erp.service';
import { tap } from 'rxjs/operators';
import { DocumentsList } from '../shared/documents/documents-list';

@Injectable()
export class ServiceJobsService extends DocumentsList<b2bServiceJobs.ListItemResponse, b2bServiceJobs.FilteringOptions, b2bServiceJobs.ListResponse> {
    
    columns: b2bDocuments.ColumnConfig[];
    statuses: b2bCommon.Option2[];
    listResponseProperty = 'serviceJobs';
    emptyListMessage: b2bDocuments.EmptyListInfo;
    defaultStatusId = -1;

    constructor(
        httpClient: HttpClient,
        menuService: MenuService,
        accountService: AccountService,
        private erpService: ERPService
    ) {
        super(httpClient, menuService, accountService);

        this.currentFilter = Object.assign(this.currentFilter, this.getDefaultFilteringOptions());
        this.emptyListMessage = { resx: 'noServiceJobs', svgId: 'Pending' };

        this.columns = [
            {
                property: 'documentNumber',
                translation: 'number',
                filter: { property: 'documentNumber', type: 'text' }
            },
            {
                property: 'myDocumentNumber',
                translation: 'myNumber',
                filter: { property: 'myDocumentNumber', type: 'text' }
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
            {
                property: 'status',
                filter: {
                    property: 'statusId',
                    type: 'select',
                    valuesProperty: 'statuses',
                    valuesLoader: this.loadStatuses.bind(this),
                    defaultValue: this.defaultStatusId
                }
            },
            { property: 'creationDate', type: 'dateWithTime' },
            { property: 'realizationDate', translation: 'expectedDate', type: 'dateWithTime' },
            { property: 'plannedEndDate', type: 'dateWithTime' }

        ];
    }

    protected getDefaultFilteringOptions() {

        return Object.assign(this.getSharedDefaultFilteringOptions(),
            {
                documentNumber: '',
                myDocumentNumber: '',
                statusId: this.defaultStatusId,
                stateId: this.defaultState
            }
        );
    }

    protected requestFilteringStates(): Observable<b2bDocuments.StateResource[]> {
        return this.erpService.context.serviceJobs.filterStates();
    }

    loadStatuses() {
        if (this.statuses) {
            return of(this.statuses);
        }

        return this.erpService.context.serviceJobs.filterStatuses().pipe(tap(res => {
            this.statuses = res;
            return res;
        }));
    }


    getDocumentRouterLink(item: b2bServiceJobs.ListItemResponse): string[] {
        return [this.menuService.routePaths.serviceJobDetails, item.id + ''];
    }


    protected requestList() {

        const params = Object.assign(this.getSharedRequestParams(),
            {
                documentNumber: this.currentFilter.documentNumber,
                myDocumentNumber: this.currentFilter.myDocumentNumber,
                statusId: this.currentFilter.statusId,
                stateId: this.currentFilter.stateId
            }
        );

        return this.erpService.context.serviceJobs.list(params);
    }
}
