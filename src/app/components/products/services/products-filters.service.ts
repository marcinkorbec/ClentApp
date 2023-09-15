import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { Subject, Observable } from 'rxjs';
import { ArticlesGroupFiltersService } from './articles-group-filters.service';
import { FilterType } from '../../../model/shared/enums/filter-type.enum';
import { GlobalFiltersService } from './global-filters.service';


@Injectable()
export class ProductsFiltersService {

    private _filtersChanged: Subject<b2bProductsFilters.FiltersSummary>;
    filtersChanged$: Observable<b2bProductsFilters.FiltersSummary>;

    private _filterSetsChanged: Subject<b2bProductsFilters.FilterSetsSummary>;
    filterSetsChanged$: Observable<b2bProductsFilters.FilterSetsSummary>;

    private _displayFiltersDialog: Subject<void>;
    displayFiltersDialog$: Observable<void>;

    constructor(
        private articlesGroupFiltersService: ArticlesGroupFiltersService,
        private globalFiltersService: GlobalFiltersService) {

        this._filtersChanged = new Subject<b2bProductsFilters.FiltersSummary>();
        this.filtersChanged$ = this._filtersChanged as Observable<b2bProductsFilters.FiltersSummary>;

        this._filterSetsChanged = new Subject<b2bProductsFilters.FilterSetsSummary>();
        this.filterSetsChanged$ = this._filterSetsChanged as Observable<b2bProductsFilters.FilterSetsSummary>;

        this._displayFiltersDialog = new Subject<void>();
        this.displayFiltersDialog$ = this._displayFiltersDialog as Observable<void>;
    }

    openFiltersDialog() {
        this._displayFiltersDialog.next();
    }

    changeFilters(filtersSummary: b2bProductsFilters.FiltersSummary) {
        this._filtersChanged.next(filtersSummary);
    }

    changeFilterSets(filterSetsSummary: b2bProductsFilters.FilterSetsSummary) {
        this._filterSetsChanged.next(filterSetsSummary);
    }

    prepareEmptyForm() {
        return this.globalFiltersService.prepareEmptyFormGroup();
    }

    prepareFilterForm(filtersSummary: b2bProductsFilters.FiltersSummary) {
        const tempFormGroup = {};
        const articleGroupFiltersFormGroup = this.articlesGroupFiltersService.prepareFilterFormGroup(filtersSummary?.articleGroupFilters);
        const globalFiltersFormGroup = this.globalFiltersService.prepareFilterFormGroup(filtersSummary?.globalFilters);

        tempFormGroup[FilterType.ArticleGroupFilters] = articleGroupFiltersFormGroup;
        tempFormGroup[FilterType.GlobalFilters] = globalFiltersFormGroup;

        return new FormGroup(tempFormGroup);
    }

    prepareSelectedFiltersValuesSummary(formValues: any, filtersSummary: b2bProductsFilters.FiltersSummary, activeFilterSet: b2bProductsFilters.FilterSetIdentifier): b2bProductsFilters.SelectedFiltersValuesSummary {
        const articleGroupFiltersFormValues = formValues[FilterType.ArticleGroupFilters];
        const globalFiltersFormValues = formValues[FilterType.GlobalFilters];

        const articleGroupFiltersValues = this.articlesGroupFiltersService.prepareSelectedProductGroupFilterValues(articleGroupFiltersFormValues, filtersSummary?.articleGroupFilters);
        const globalFiltersValues = this.globalFiltersService.prepareSelectedGlobalFilterValues(globalFiltersFormValues, filtersSummary?.globalFilters);

        const haveAnySelectedFiltersValuesToShow = this.checkIfHaveAnySelectedFiltersValuesToShow(articleGroupFiltersValues, globalFiltersValues);
        const haveAnySelectedFiltersValues = this.checkIfHaveAnySelectedFiltersValues(articleGroupFiltersValues, globalFiltersValues);

        return { articleGroupFiltersValues, globalFiltersValues, haveAnySelectedFiltersValuesToShow, haveAnySelectedFiltersValues, activeFilterSet };
    }

    prepareClearFilterValueModel(formValues: any, resetFilterData: b2bProductsFilters.ResetFiltersValuesSummary) {
        const articleGroupFiltersFormValues = formValues[FilterType.ArticleGroupFilters];
        const globalFiltersFormValues = formValues[FilterType.GlobalFilters];

        const clearArticleGroupFilterValueModel = this.articlesGroupFiltersService.prepareClearFilterValueModel(articleGroupFiltersFormValues, resetFilterData.resetArticleGroupFilterValue);
        const clearGlobalFilterValueModel = this.globalFiltersService.prepareClearFilterValueModel(globalFiltersFormValues, resetFilterData.resetGlobalFilterValue);

        const tempFormValuesModel = {};
        tempFormValuesModel[FilterType.ArticleGroupFilters] = clearArticleGroupFilterValueModel;
        tempFormValuesModel[FilterType.GlobalFilters] = clearGlobalFilterValueModel;

        return tempFormValuesModel;
    }

    checkIfPossibleToExpandFilter(filterType: FilterType, filterId: any, selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        if (!selectedFiltersSummary) {
            return false;
        }

        switch (filterType) {
            case FilterType.ArticleGroupFilters:
                return this.articlesGroupFiltersService.checkIfPossibleToExpandFilter(filterId, selectedFiltersSummary.articleGroupFiltersValues);
            case FilterType.GlobalFilters:
                return this.globalFiltersService.checkIfPossibleToExpandFilter(filterId, selectedFiltersSummary.globalFiltersValues);
            default:
                return false;
        }
    }

    private checkIfHaveAnySelectedFiltersValuesToShow(articleGroupFiltersValues: b2bProductsFilters.SelectedArticleGroupFilterValue[], globalFiltersValues: b2bProductsFilters.SelectedGlobalFilterValue[]): boolean {
        const haveAnyArticleGroupFiltersValuesToShow = this.articlesGroupFiltersService.checkIfHaveAnyFiltersSelectedValuesToShow(articleGroupFiltersValues);
        const haveAnyGlobalFiltersValuesToShow = this.globalFiltersService.checkIfHaveAnySelectedFiltersValuesToShow(globalFiltersValues);

        return haveAnyArticleGroupFiltersValuesToShow || haveAnyGlobalFiltersValuesToShow;
    }

    private checkIfHaveAnySelectedFiltersValues(articleGroupFiltersValues: b2bProductsFilters.SelectedArticleGroupFilterValue[], globalFiltersValues: b2bProductsFilters.SelectedGlobalFilterValue[]): boolean {
        const haveAnyArticleGroupFiltersValues = this.articlesGroupFiltersService.checkIfHaveAnySelectedFiltersValues(articleGroupFiltersValues);
        const haveAnyGlobalFiltersValues = this.globalFiltersService.checkIfHaveAnySelectedFiltersValues(globalFiltersValues);

        return haveAnyArticleGroupFiltersValues || haveAnyGlobalFiltersValues;
    }

    prepareClearAllFiltersSummary(filtersSummary: b2bProductsFilters.FiltersSummary) {
        if (!filtersSummary) {
            return null;
        }

        const articleGroupFilters = this.articlesGroupFiltersService.prepareClearAllArticleGroupFilters(filtersSummary.articleGroupFilters);
        const globalFilters = this.globalFiltersService.prepareClearAllGlobalFilters(filtersSummary.globalFilters);

        return {
            articleGroupFilters,
            globalFilters,
        };
    }

    prepareFiltersSummaryFromFilterSet(filterSet: b2bProductsFilters.FilterSet, filtersSummary: b2bProductsFilters.FiltersSummary): b2bProductsFilters.FiltersSummary {
        if (!filterSet || !filtersSummary) {
            return filtersSummary;
        }

        const articleGroupFilters = this.articlesGroupFiltersService.prepareFiltersFromFilterSet(filterSet.articleGroupFilters, filtersSummary.articleGroupFilters);
        const globalFilters = this.globalFiltersService.prepareFiltersFromFilterSet(filterSet.globalFilters, filtersSummary.globalFilters);

        return {
            articleGroupFilters,
            globalFilters,
        };
    }
}
