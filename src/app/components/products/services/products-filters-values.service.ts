import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { ArticlesGroupFiltersService } from './articles-group-filters.service';
import { GlobalFiltersService } from './global-filters.service';

@Injectable()
export class ProductsFiltersValuesService {

    private _filtersValuesChanged: Subject<b2bProductsFilters.SelectedFiltersValuesSummary>;
    filtersValuesChanged$: Observable<b2bProductsFilters.SelectedFiltersValuesSummary>;

    private filterValueCleared: Subject<b2bProductsFilters.ResetFiltersValuesSummary>;
    filterValueCleared$: Observable<b2bProductsFilters.ResetFiltersValuesSummary>;

    private allFiltersValuesCleared: Subject<void>;
    allFiltersValuesCleared$: Observable<void>;

    constructor(
        private articlesGroupFiltersService: ArticlesGroupFiltersService,
        private globalFiltersService: GlobalFiltersService) {

        this._filtersValuesChanged = new Subject<b2bProductsFilters.SelectedFiltersValuesSummary>();
        this.filtersValuesChanged$ = this._filtersValuesChanged as Observable<b2bProductsFilters.SelectedFiltersValuesSummary>;

        this.filterValueCleared = new Subject<b2bProductsFilters.ResetFiltersValuesSummary>();
        this.filterValueCleared$ = this.filterValueCleared as Observable<b2bProductsFilters.ResetFiltersValuesSummary>;

        this.allFiltersValuesCleared = new Subject<void>();
        this.allFiltersValuesCleared$ = this.allFiltersValuesCleared as Observable<void>;
    }

    changeFiltersValues(selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        this._filtersValuesChanged.next(selectedFiltersSummary);
    }

    resetArticleGroupFilterValue(valueToReset: b2bProductsFilters.ArticleGroupFilterValue, selectedFilter: b2bProductsFilters.SelectedArticleGroupFilterValue) {
        const resetFilterModel = this.articlesGroupFiltersService.prepareResetFilterValueSummary(valueToReset, selectedFilter);
        this.filterValueCleared.next(resetFilterModel);
    }

    resetGlobalFilterValue(valueToReset: b2bProductsFilters.GlobalFilterValue, selectedFilter: b2bProductsFilters.SelectedGlobalFilterValue) {
        const resetFilterModel = this.globalFiltersService.prepareResetFilterValueSummary(valueToReset, selectedFilter);
        this.filterValueCleared.next(resetFilterModel);
    }

    resetAllFiltersValues() {
        this.allFiltersValuesCleared.next();
    }
}
