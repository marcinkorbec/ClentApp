import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { MultiChoiceFilterService } from './multi-choice-filter.service';
import { BaseFilters } from './base-filters';
import { Config } from '../../../helpers/config';


@Injectable()
export class ArticlesGroupFiltersService extends BaseFilters {

    constructor(private multiChoiceFilterService: MultiChoiceFilterService) {
        super();
    }

    prepareFilterFormGroup(articleGroupFilters: b2bProductsFilters.ArticleGroupFilter[]) {
        if (!articleGroupFilters || articleGroupFilters.length === 0) {
            return super.prepareEmptyFormGroup();
        }

        const tempFormGroup = {};
        articleGroupFilters.forEach(articleGroupFilter => {
            const formArray = this.multiChoiceFilterService.prepareFilterFormArray(<b2bProductsFilters.ArticleGroupFilterValue[]>articleGroupFilter.selectedValue, <b2bProductsFilters.ArticleGroupFilterValue[]>articleGroupFilter.defaultValue, articleGroupFilter.values, Config.commonFilterValueIdPropertyName);
            tempFormGroup[articleGroupFilter.filterId] = formArray;
        });

        return new FormGroup(tempFormGroup);
    }

    prepareSelectedProductGroupFilterValues(articleGroupFiltersFormValues: any, articleGroupFilters: b2bProductsFilters.ArticleGroupFilter[]): b2bProductsFilters.SelectedArticleGroupFilterValue[] {
        if (!articleGroupFilters || articleGroupFilters.length === 0) {
            return null;
        }

        const selectedFiltersValues: b2bProductsFilters.SelectedArticleGroupFilterValue[] = [];

        articleGroupFilters.forEach(articleGroupFilter => {
            const filterFormValues = articleGroupFiltersFormValues[articleGroupFilter.filterId] as any[];
            const selectedValues = this.multiChoiceFilterService.prepareSelectedFiltersValues<b2bProductsFilters.ArticleGroupFilterValue>(filterFormValues, articleGroupFilter.values);
            const selectedValuesToShow = this.multiChoiceFilterService.prepareFiltersValuesToShow<b2bProductsFilters.ArticleGroupFilterValue>(selectedValues);

            if (selectedValues && selectedValues.length > 0) {
                const selectedFilterValue: b2bProductsFilters.SelectedArticleGroupFilterValue = {
                    ...articleGroupFilter,
                    selectedValue: selectedValues,
                    selectedValueToShow: selectedValuesToShow,
                };
                selectedFiltersValues.push(selectedFilterValue);
            }
        });

        return selectedFiltersValues;
    }

    prepareClearFilterValueModel(articleGroupFiltersFormValues: any, resetFilterData: b2bProductsFilters.ResetArticleGroupFilterValueModel) {
        if (!resetFilterData) {
            return articleGroupFiltersFormValues;
        }

        const selectedFilter = resetFilterData.selectedFilterValue;
        const filterId = resetFilterData.selectedFilterValue.filterId;

        const filterFormValues = articleGroupFiltersFormValues[filterId] as any[];
        const clearFilterValueModel = this.multiChoiceFilterService.prepareClearFilterValueModel(filterFormValues, resetFilterData.valueToReset, selectedFilter.values, <b2bProductsFilters.ArticleGroupFilterValue[]>selectedFilter.defaultValue, String(filterId), Config.commonFilterValueIdPropertyName);

        return {
            ...articleGroupFiltersFormValues,
            ...clearFilterValueModel,
        };
    }

    prepareResetFilterValueSummary(valueToReset: b2bProductsFilters.ArticleGroupFilterValue, selectedFilterValue: b2bProductsFilters.SelectedArticleGroupFilterValue): b2bProductsFilters.ResetFiltersValuesSummary {
        const resetArticleGroupFilterValue = { selectedFilterValue, valueToReset };
        return { resetArticleGroupFilterValue };
    }

    checkIfPossibleToExpandFilter(filterId: number, selectedFilterValues: b2bProductsFilters.SelectedArticleGroupFilterValue[]) {
        if (!selectedFilterValues || selectedFilterValues.length === 0) {
            return false;
        }

        return selectedFilterValues.some(filter => filter.filterId === filterId);
    }

    checkIfHaveAnyFiltersSelectedValuesToShow(filtersValues: b2bProductsFilters.SelectedArticleGroupFilterValue[]): boolean {
        if (!filtersValues || filtersValues.length === 0) {
            return false;
        }

        return filtersValues.some(filterValues => this.multiChoiceFilterService.checkIfHaveAnySelectedFilterValuesToShow(<string[]>filterValues.selectedValueToShow));
    }

    checkIfHaveAnySelectedFiltersValues(filtersValues: b2bProductsFilters.SelectedArticleGroupFilterValue[]): boolean {
        if (!filtersValues || filtersValues.length === 0) {
            return false;
        }

        return filtersValues.some(filterValues => this.multiChoiceFilterService.checkIfHaveAnySelectedFilterValues(<string[]>filterValues.selectedValue));
    }

    prepareClearAllArticleGroupFilters(articleGroupFilters: b2bProductsFilters.ArticleGroupFilter[]) {
        if (!articleGroupFilters || articleGroupFilters.length === 0) {
            return null;
        }

        return super.prepareClearAllFilters(articleGroupFilters, Config.commonSelectedFilterValuePropertyName, Config.commonSelectedFilterValueToShowPropertyName);
    }

    prepareFiltersFromFilterSet(articleGroupFilterSetModels: b2bProductsFilters.ArticleGroupFilterSetModel[], articleGroupFilters: b2bProductsFilters.ArticleGroupFilter[]): b2bProductsFilters.ArticleGroupFilter[] {
        return articleGroupFilters?.map(articleGroupFilter => {
            return this.prepareFilterFromFilterSet(articleGroupFilterSetModels, articleGroupFilter);
        });
    }

    private prepareFilterFromFilterSet(articleGroupFilterSetModels: b2bProductsFilters.ArticleGroupFilterSetModel[], articleGroupFilter: b2bProductsFilters.ArticleGroupFilter): b2bProductsFilters.ArticleGroupFilter {
        const articleGroupFilterSetModel = articleGroupFilterSetModels?.find(articleGroupFilterSetModel => articleGroupFilterSetModel.filterId === articleGroupFilter.filterId);

        articleGroupFilter.selectedValue = this.multiChoiceFilterService.prepareFilterSelectedValuesFromValuesToSelect(articleGroupFilter.values, articleGroupFilterSetModel?.valueIds, Config.commonFilterValueIdPropertyName);
        return articleGroupFilter;
    }

    prepareSelectedFiltersValuesRequestModel(selectedFiltersValues: b2bProductsFilters.SelectedArticleGroupFilterValue[]): b2bProductsFilters.ArticleGroupFilterRequestModel[] {
        return selectedFiltersValues?.map(selectedFilterValues => {
            return this.prepareSelectedFilterValuesRequestModel(selectedFilterValues);
        });
    }

    private prepareSelectedFilterValuesRequestModel(selectedFilterValues: b2bProductsFilters.SelectedArticleGroupFilterValue): b2bProductsFilters.ArticleGroupFilterRequestModel {
        const valueIds: number[] = this.multiChoiceFilterService.convertFilterSelectedValues<b2bProductsFilters.ArticleGroupFilterValue, number>(<b2bProductsFilters.ArticleGroupFilterValue[]>selectedFilterValues.selectedValue, Config.commonFilterValueIdPropertyName);

        return {
            filterId: selectedFilterValues.filterId,
            valueIds,
        };
    }
}
