import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { b2bProducts } from 'src/integration/products/b2b-products';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { ConfigService } from '../config.service';
import { ApplicationType } from '../enums/application-type.enum';
import { FilterSetModalStatus } from './enums/filter-set-modal-status.enum';
import { UpdateFilterSetsExtraActionType } from './enums/update-filter-sets-extra-action-type.enum';
import { ProductsRequestsService } from './products-requests.service';


@Injectable()
export class ProductsFiltersSetsService {

    private _filterSets: b2bProductsFilters.FilterSet[];

    constructor(
        private configService: ConfigService,
        private productsRequestsService: ProductsRequestsService) {
    }

    getFilterSets(groupId: number, updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType = UpdateFilterSetsExtraActionType.ResetActiveFilterSet): Observable<b2bProductsFilters.PerformFilterSetActionSummary> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getFilterSetsXl(groupId, updateFilterSetsExtraActionType);
            case ApplicationType.ForAltum:
                return this.getFilterSetsAltum(groupId, updateFilterSetsExtraActionType);
            default:
                console.error(`getFilterSets(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private getFilterSetsXl(groupId: number, updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType) {
        const request = this.prepareGetFilterSetsBaseRequest(groupId);
        return this.productsRequestsService.getFilterSetsXlRequest(request).pipe(
            map(resp => {
                return this.inCaseSuccessGetFilterSetsBase(resp, updateFilterSetsExtraActionType);
            })
        );
    }

    private getFilterSetsAltum(groupId: number, updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType) {
        const request = this.prepareGetFilterSetsBaseRequest(groupId);
        return this.productsRequestsService.getFilterSetsAltumRequest(request).pipe(
            map(resp => {
                return this.inCaseSuccessGetFilterSetsBase(resp, updateFilterSetsExtraActionType);
            })
        );
    }

    private inCaseSuccessGetFilterSetsBase(response: b2bProducts.GetFilterSetsBaseResponse, updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType): b2bProductsFilters.PerformFilterSetActionSummary {
        const filterSetsSummary = this.prepareUpdatedFilterSetsSummary(response.filterSets, updateFilterSetsExtraActionType);
        return { filterSetsSummary };
    }

    private prepareGetFilterSetsBaseRequest(groupId: number): b2bProducts.GetFilterSetsBaseRequest {
        return { groupId };
    }

    deleteFilterSet(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier): Observable<b2bProductsFilters.PerformFilterSetActionSummary> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.deleteFilterSetXl(filterSetIdentifier);
            case ApplicationType.ForAltum:
                return this.deleteFilterSetAltum(filterSetIdentifier);
            default:
                console.error(`deleteFilterSet(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private deleteFilterSetXl(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        const request = this.prepareDeleteFilterSetBaseRequest(filterSetIdentifier.filterSetId);
        return this.productsRequestsService.deleteFilterSetXlRequest(request).pipe(
            map(() => {
                return this.inCaseSuccessDeleteFilterSetBase(filterSetIdentifier);
            }),
            catchError(() => {
                return this.inCaseErrorPerformActionFilterSetBase(filterSetIdentifier, FilterSetModalStatus.DeletionFailed);
            })
        );
    }

    private deleteFilterSetAltum(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        const request = this.prepareDeleteFilterSetBaseRequest(filterSetIdentifier.filterSetId);
        return this.productsRequestsService.deleteFilterSetAltumRequest(request).pipe(
            map(() => {
                return this.inCaseSuccessDeleteFilterSetBase(filterSetIdentifier);
            }),
            catchError(() => {
                return this.inCaseErrorPerformActionFilterSetBase(filterSetIdentifier, FilterSetModalStatus.DeletionFailed);
            })
        );
    }

    private inCaseSuccessDeleteFilterSetBase(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier): b2bProductsFilters.PerformFilterSetActionSummary {
        const actionStatus = this.prepareFilterSetActionStatus(filterSetIdentifier, FilterSetModalStatus.DeletedSuccessfully);
        return { actionStatus };
    }

    private prepareDeleteFilterSetBaseRequest(filterSetId: number): b2bProducts.DeleteFilterSetBaseRequest {
        return { filterSetId };
    }


    addFilterSet(groupId: number, saveFilterRequestModel: b2bProductsFilters.SaveFiltersRequestModel): Observable<b2bProductsFilters.PerformFilterSetActionSummary> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.addFilterSetXl(groupId, saveFilterRequestModel);
            case ApplicationType.ForAltum:
                return this.addFilterSetAltum(groupId, saveFilterRequestModel);
            default:
                console.error(`addFilterSet(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }


    private addFilterSetXl(groupId: number, saveFilterRequestModel: b2bProductsFilters.SaveFiltersRequestModel): Observable<b2bProductsFilters.PerformFilterSetActionSummary> {
        const request = this.prepareAddFilterSetBaseRequest(groupId, saveFilterRequestModel);
        return this.productsRequestsService.addFilterSetXlRequest(request).pipe(
            map((res: b2bProducts.AddFilterSetBaseResponse) => {
                return this.inCaseSuccessAddFilterSetBase(res);
            }),
            catchError(() => {
                return this.inCaseErrorPerformActionFilterSetBase({ filterSetName: request.filterSetName }, FilterSetModalStatus.AddingFailed);
            })
        );
    }

    private addFilterSetAltum(groupId: number, saveFilterRequestModel: b2bProductsFilters.SaveFiltersRequestModel): Observable<b2bProductsFilters.PerformFilterSetActionSummary> {
        const request = this.prepareAddFilterSetBaseRequest(groupId, saveFilterRequestModel);
        return this.productsRequestsService.addFilterSetAltumRequest(request).pipe(
            map((res: b2bProducts.AddFilterSetBaseResponse) => {
                return this.inCaseSuccessAddFilterSetBase(res);
            }),
            catchError(() => {
                return this.inCaseErrorPerformActionFilterSetBase({ filterSetName: request.filterSetName }, FilterSetModalStatus.AddingFailed);
            })
        );
    }

    private inCaseSuccessAddFilterSetBase(response: b2bProducts.AddFilterSetBaseResponse): b2bProductsFilters.PerformFilterSetActionSummary {
        const { savedFilterSet } = response;
        const filterSetIdentifier = this.prepareFilterSetIdentifier(savedFilterSet.filterSetName, savedFilterSet.filterSetId);

        const actionStatus = this.prepareFilterSetActionStatus(filterSetIdentifier, FilterSetModalStatus.AddedSuccessfully);
        const filterSetsSummary = this.extendFilterSets(savedFilterSet);
        return { actionStatus, filterSetsSummary };
    }

    private prepareAddFilterSetBaseRequest(groupId: number, requestModel: b2bProductsFilters.SaveFiltersRequestModel): b2bProducts.AddFilterSetBaseRequest {
        return {
            groupId,
            filterSetName: requestModel.filterSetName,
            globalFilters: requestModel.globalFilters,
            articleGroupFilters: requestModel.articleGroupFilters,
        };
    }

    private extendFilterSets(filterSet: b2bProductsFilters.FilterSet): b2bProductsFilters.FilterSetsSummary {
        let filterSets = this._filterSets?.slice();
        if (filterSets) {
            filterSets.push(filterSet);
        } else {
            filterSets = [filterSet];
        }

        return this.prepareUpdatedFilterSetsSummary(filterSets, UpdateFilterSetsExtraActionType.UpdateActiveFilterSet, filterSet.filterSetId);
    }


    updateFilterSetName(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier): Observable<b2bProductsFilters.PerformFilterSetActionSummary> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.updateFilterSetNameXl(newFilterSetIdentifier);
            case ApplicationType.ForAltum:
                return this.updateFilterSetNameAltum(newFilterSetIdentifier);
            default:
                console.error(`updateFilterSetName(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }


    private updateFilterSetNameXl(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        const request = this.prepareUpdateFilterSetNameBaseRequest(newFilterSetIdentifier);
        return this.productsRequestsService.updateFilterSetNameXlRequest(request).pipe(
            map(() => {
                return this.inCaseSuccessUpdateFilterSetNameBase(newFilterSetIdentifier);
            }),
            catchError(() => {
                return this.inCaseErrorPerformActionFilterSetBase(newFilterSetIdentifier, FilterSetModalStatus.UpdatingNameFailed);
            })
        );
    }

    private updateFilterSetNameAltum(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        const request = this.prepareUpdateFilterSetNameBaseRequest(newFilterSetIdentifier);
        return this.productsRequestsService.updateFilterSetNameAltumRequest(request).pipe(
            map(() => {
                return this.inCaseSuccessUpdateFilterSetNameBase(newFilterSetIdentifier);
            }),
            catchError(() => {
                return this.inCaseErrorPerformActionFilterSetBase(newFilterSetIdentifier, FilterSetModalStatus.UpdatingNameFailed);
            })
        );
    }

    private inCaseSuccessUpdateFilterSetNameBase(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier): b2bProductsFilters.PerformFilterSetActionSummary {
        const actionStatus = this.prepareFilterSetActionStatus(newFilterSetIdentifier, FilterSetModalStatus.NameUpdatedSuccessfully);
        const filterSetsSummary = this.refreshFilterSetName(newFilterSetIdentifier);
        return { actionStatus, filterSetsSummary };
    }

    private prepareUpdateFilterSetNameBaseRequest(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier): b2bProducts.UpdateFilterSetNameBaseRequest {
        return {
            filterSetId: newFilterSetIdentifier.filterSetId,
            newFilterSetName: newFilterSetIdentifier.filterSetName,
        };
    }

    private refreshFilterSetName(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        const updatedFilterSet = this._filterSets?.find(filterSet => filterSet.filterSetId === newFilterSetIdentifier.filterSetId);

        if (updatedFilterSet) {
            updatedFilterSet.filterSetName = newFilterSetIdentifier.filterSetName;
        }

        return this.prepareUpdatedFilterSetsSummary(this._filterSets?.slice());
    }

    private inCaseErrorPerformActionFilterSetBase(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier, filterSetModalStatus: FilterSetModalStatus): Observable<b2bProductsFilters.PerformFilterSetActionSummary> {
        const actionStatus = this.prepareFilterSetActionStatus(filterSetIdentifier, filterSetModalStatus);
        return of({actionStatus});
    }

    private prepareFilterSetActionStatus(filterSetIdentifier: b2bProductsFilters.FilterSetIdentifier, filterSetModalStatus: FilterSetModalStatus): b2bProductsFilters.FilterSetActionStatus {
        return { filterSetIdentifier, filterSetModalStatus };
    }

    private prepareFilterSetIdentifier(filterSetName: string, filterSetId?: number): b2bProductsFilters.FilterSetIdentifier {
        return { filterSetName, filterSetId };
    }

    private prepareUpdatedFilterSetsSummary(filterSets: b2bProductsFilters.FilterSet[], updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType = UpdateFilterSetsExtraActionType.None, activeFilterSetId: number = null): b2bProductsFilters.FilterSetsSummary {
        this._filterSets = filterSets;
        const summary = this.prepareFilterSetsSummary(filterSets, updateFilterSetsExtraActionType, activeFilterSetId);
        return summary;
    }

    private prepareFilterSetsSummary(filterSets: b2bProductsFilters.FilterSet[], updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType, activeFilterSetId: number): b2bProductsFilters.FilterSetsSummary {
        return { filterSets, updateFilterSetsExtraActionType, activeFilterSetId };
    }
}
