import { Injectable } from '@angular/core';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { Subject, Observable } from 'rxjs';
import { GlobalFiltersService } from './global-filters.service';
import { ArticlesGroupFiltersService } from './articles-group-filters.service';

@Injectable()
export class UpdateProductsFilterSetService {

    private filterSetFormChanged: Subject<b2bProductsFilters.SelectedFiltersValuesSummary>;
    filterSetFormChanged$: Observable<b2bProductsFilters.SelectedFiltersValuesSummary>;

    private saveFiltersClicked: Subject<b2bProductsFilters.SaveFiltersRequestModel>;
    saveFiltersClicked$: Observable<b2bProductsFilters.SaveFiltersRequestModel>;

    private changeFilterSetNameClicked: Subject<b2bProductsFilters.FilterSetIdentifier>;
    changeFilterSetNameClicked$: Observable<b2bProductsFilters.FilterSetIdentifier>;

    constructor(private articlesGroupFiltersService: ArticlesGroupFiltersService,
        private globalFiltersService: GlobalFiltersService) {

        this.filterSetFormChanged = new Subject<b2bProductsFilters.SelectedFiltersValuesSummary>();
        this.filterSetFormChanged$ = this.filterSetFormChanged as Observable<b2bProductsFilters.SelectedFiltersValuesSummary>;

        this.saveFiltersClicked = new Subject<b2bProductsFilters.SaveFiltersRequestModel>();
        this.saveFiltersClicked$ = this.saveFiltersClicked as Observable<b2bProductsFilters.SaveFiltersRequestModel>;

        this.changeFilterSetNameClicked = new Subject<b2bProductsFilters.FilterSetIdentifier>();
        this.changeFilterSetNameClicked$ = this.changeFilterSetNameClicked as Observable<b2bProductsFilters.FilterSetIdentifier>;
    }

    updateFilterSetForm(selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        this.filterSetFormChanged.next(selectedFiltersSummary);
    }

    saveFilters(filterSetName: string, selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        const requestModel = this.prepareSaveFiltersRequestModel(filterSetName, selectedFiltersSummary);
        this.saveFiltersClicked.next(requestModel);
    }

    private prepareSaveFiltersRequestModel(filterSetName: string, selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary): b2bProductsFilters.SaveFiltersRequestModel {
        if (!selectedFiltersSummary) {
            return null;
        }

        const articleGroupFilters = this.articlesGroupFiltersService.prepareSelectedFiltersValuesRequestModel(selectedFiltersSummary.articleGroupFiltersValues);
        const globalFilters = this.globalFiltersService.prepareSelectedFiltersValuesRequestModel(selectedFiltersSummary.globalFiltersValues);

        return { filterSetName, articleGroupFilters, globalFilters };
    }

    changeFilterSetName(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        this.changeFilterSetNameClicked.next(newFilterSetIdentifier);
    }
}
