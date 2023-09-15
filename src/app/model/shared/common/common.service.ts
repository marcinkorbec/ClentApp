import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { b2bCommon } from 'src/integration/shared/b2b-common';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { ApplicationType } from '../../enums/application-type.enum';
import { ConfigService } from '../../config.service';
import { CommonRequestsService } from './common-requests.service';
import { GlobalFilterType } from '../enums/global-filter-type.enum';
import { StockLevelFilterType } from '../enums/stock-level-filter-type.enum';

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    private _globalFiltersChanged: BehaviorSubject<b2bProductsFilters.GlobalFilter[]>;
    globalFiltersChanged$: Observable<b2bProductsFilters.GlobalFilter[]>;

    constructor(
        private configService: ConfigService,
        private commonRequestsService: CommonRequestsService) {

        this._globalFiltersChanged = new BehaviorSubject<b2bProductsFilters.GlobalFilter[]>(null);
        this.globalFiltersChanged$ = this._globalFiltersChanged as Observable<b2bProductsFilters.GlobalFilter[]>;
    }

    getGlobalFilters() {
        if (this._globalFiltersChanged.value) {
            this._globalFiltersChanged.next(this._globalFiltersChanged.value);
            return;
        }
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getGlobalFiltersXl();
            case ApplicationType.ForAltum:
                return this.getGlobalFiltersAltum();
            default:
                console.error(`getGlobalFilters(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    clearGlobalFilters() {
        this._globalFiltersChanged.next(null);
    }


    private getGlobalFiltersXl() {
        this.commonRequestsService.getGlobalFiltersXlRequest().subscribe(this.inCaseSuccessGetArticleGroupFiltersBase.bind(this));
    }

    private getGlobalFiltersAltum() {
        this.commonRequestsService.getGlobalFiltersAltumRequest().subscribe(this.inCaseSuccessGetArticleGroupFiltersBase.bind(this));
    }

    private inCaseSuccessGetArticleGroupFiltersBase(response: b2bCommon.GetGlobalFiltersBaseResponse) {
        response.globalFilters.forEach(filter => { //TODO - temp solution, default values should comes from API
            switch (filter.filterType) {
                case GlobalFilterType.Warehouse:
                    const defaultWarehouseId = this.configService.config.warehouseId;
                    filter.defaultValue = filter.values.find(filter => filter.id === defaultWarehouseId);
                    break;
                case GlobalFilterType.StockLevel:
                    filter.defaultValue = filter.values.find(filter => filter.id === StockLevelFilterType.All);
                    break;
            }
        });
        this._globalFiltersChanged.next(response.globalFilters);
    }
}
