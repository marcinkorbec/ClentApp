import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { MultiChoiceFilterService } from './multi-choice-filter.service';
import { Config } from '../../../helpers/config';
import { FilterDisplayType } from '../../../model/shared/enums/filter-display-type.enum';
import { SingleChoiceFilterService } from './single-choice-filter.service';
import { GlobalFilterType } from '../../../model/shared/enums/global-filter-type.enum';
import { BaseFilters } from './base-filters';

@Injectable()
export class GlobalFiltersService extends BaseFilters {

    constructor(
        private multiChoiceFilterService: MultiChoiceFilterService,
        private singleChoiceFilterService: SingleChoiceFilterService) {

        super();
    }

    prepareFilterFormGroup(globalFilters: b2bProductsFilters.GlobalFilter[]) {
        if (!globalFilters || globalFilters.length === 0) {
            return super.prepareEmptyFormGroup();
        }

        const tempFormGroup = {};
        let control: any;
        globalFilters.forEach(globalFilter => {
            switch (globalFilter.filterDisplayType) {
                case FilterDisplayType.SingleChoiceList:
                    control = this.singleChoiceFilterService.prepareFilterFormControl(<b2bProductsFilters.GlobalFilterValue>globalFilter.selectedValue, <b2bProductsFilters.GlobalFilterValue>globalFilter.defaultValue, Config.commonFilterValueIdPropertyName);
                    break;
                case FilterDisplayType.MultipleChoiceList:
                    control = this.multiChoiceFilterService.prepareFilterFormArray(<b2bProductsFilters.GlobalFilterValue[]>globalFilter.selectedValue, <b2bProductsFilters.GlobalFilterValue[]>globalFilter.defaultValue, globalFilter.values, Config.commonFilterValueIdPropertyName);
                    break;
            }

            tempFormGroup[globalFilter.filterType] = control;
        });

        return new FormGroup(tempFormGroup);
    }

    prepareSelectedGlobalFilterValues(globalFiltersFormValues: any, globalFilters: b2bProductsFilters.GlobalFilter[]): b2bProductsFilters.SelectedGlobalFilterValue[] {
        if (!globalFilters || globalFilters.length === 0) {
            return null;
        }

        const selectedFilterValues: b2bProductsFilters.SelectedGlobalFilterValue[] = [];

        globalFilters.forEach(globalFilter => {
            let selectedValue: Partial<b2bProductsFilters.GlobalFilterValue | b2bProductsFilters.GlobalFilterValue[]>;
            let selectedValueToShow: Partial<b2bProductsFilters.GlobalFilterValue | b2bProductsFilters.GlobalFilterValue[]>;

            switch (globalFilter.filterDisplayType) {
                case FilterDisplayType.SingleChoiceList:
                    const filterFormValue: number = globalFiltersFormValues[globalFilter.filterType];
                    selectedValue = this.singleChoiceFilterService.prepareSelectedFilterValue(filterFormValue, globalFilter.values, Config.commonFilterValueIdPropertyName);
                    selectedValueToShow = this.singleChoiceFilterService.prepareFiltersValuesToShow(selectedValue, <b2bProductsFilters.GlobalFilterValue>globalFilter.defaultValue, Config.commonFilterValueIdPropertyName);
                    break;
                case FilterDisplayType.MultipleChoiceList:
                    const filterFormValues = globalFiltersFormValues[globalFilter.filterType] as any[];
                    selectedValue = this.multiChoiceFilterService.prepareSelectedFiltersValues<b2bProductsFilters.GlobalFilterValue>(filterFormValues, globalFilter.values);
                    selectedValueToShow = this.multiChoiceFilterService.prepareFiltersValuesToShow<b2bProductsFilters.GlobalFilterValue>(selectedValue);
                    break;
            }

            if (selectedValue) {
                const selectedFilterValue: b2bProductsFilters.SelectedGlobalFilterValue = {
                    ...globalFilter,
                    selectedValue,
                    selectedValueToShow,
                };
                selectedFilterValues.push(selectedFilterValue);
            }
        });

        return selectedFilterValues;
    }

    prepareClearFilterValueModel(globalFiltersFormValues: any, resetFilterData: b2bProductsFilters.ResetGlobalFilterValueModel) {
        if (!resetFilterData) {
            return globalFiltersFormValues;
        }

        const selectedGlobalFilter = resetFilterData.selectedFilterValue;
        const filterType = resetFilterData.selectedFilterValue.filterType;
        let clearFilterValueModel = {};
        switch (selectedGlobalFilter.filterDisplayType) {
            case FilterDisplayType.SingleChoiceList:
                clearFilterValueModel = this.singleChoiceFilterService.prepareClearFilterValueModel(filterType, <b2bProductsFilters.GlobalFilterValue>selectedGlobalFilter.defaultValue, Config.commonFilterValueIdPropertyName);
                break;
            case FilterDisplayType.MultipleChoiceList:
                const filterFormValues = globalFiltersFormValues[filterType] as any[];
                clearFilterValueModel = this.multiChoiceFilterService.prepareClearFilterValueModel(filterFormValues, resetFilterData.valueToReset, selectedGlobalFilter.values, <b2bProductsFilters.GlobalFilterValue[]>selectedGlobalFilter.defaultValue, filterType, Config.commonFilterValueIdPropertyName);
                break;
        }

        return {
            ...globalFiltersFormValues,
            ...clearFilterValueModel,
        };
    }

    prepareResetFilterValueSummary(valueToReset: b2bProductsFilters.GlobalFilterValue, selectedFilterValue: b2bProductsFilters.SelectedGlobalFilterValue): b2bProductsFilters.ResetFiltersValuesSummary {
        const resetGlobalFilterValue = { selectedFilterValue, valueToReset };
        return { resetGlobalFilterValue };
    }

    checkIfPossibleToExpandFilter(filterType: GlobalFilterType, selectedFilterValues: b2bProductsFilters.SelectedGlobalFilterValue[]) {
        if (!selectedFilterValues || selectedFilterValues.length === 0) {
            return false;
        }

        return selectedFilterValues.some(filter => filter.filterType === filterType);
    }

    checkIfHaveAnySelectedFiltersValuesToShow(filtersValues: b2bProductsFilters.SelectedGlobalFilterValue[]): boolean {
        if (!filtersValues || filtersValues.length === 0) {
            return false;
        }

        return filtersValues.some(filterValues => {
            switch (filterValues.filterDisplayType) {
                case FilterDisplayType.MultipleChoiceList:
                    return this.multiChoiceFilterService.checkIfHaveAnySelectedFilterValuesToShow(<b2bProductsFilters.GlobalFilterValue[]>filterValues.selectedValueToShow);
                case FilterDisplayType.SingleChoiceList:
                    return this.singleChoiceFilterService.checkIfHaveAnySelectedFilterValuesToShow(<b2bProductsFilters.GlobalFilterValue>filterValues.selectedValueToShow);
                default:
                    return false;
            }
        });
    }

    checkIfHaveAnySelectedFiltersValues(filtersValues: b2bProductsFilters.SelectedGlobalFilterValue[]): boolean {
        if (!filtersValues || filtersValues.length === 0) {
            return false;
        }

        return filtersValues.some(filterValues => {
            switch (filterValues.filterDisplayType) {
                case FilterDisplayType.MultipleChoiceList:
                    return this.multiChoiceFilterService.checkIfHaveAnySelectedFilterValues(<b2bProductsFilters.GlobalFilterValue[]>filterValues.selectedValue);
                case FilterDisplayType.SingleChoiceList:
                    return this.singleChoiceFilterService.checkIfHaveAnySelectedFilterValues(<b2bProductsFilters.GlobalFilterValue>filterValues.selectedValue);
                default:
                    return false;
            }
        });
    }

    prepareClearAllGlobalFilters(globalFilters: b2bProductsFilters.GlobalFilter[]) {
        if (!globalFilters || globalFilters.length === 0) {
            return null;
        }

        return super.prepareClearAllFilters(globalFilters, Config.commonSelectedFilterValuePropertyName, Config.commonSelectedFilterValueToShowPropertyName);
    }

    prepareFiltersFromFilterSet(globalFitlerSetModels: b2bProductsFilters.GlobalFilterSetModel[], globalFilters: b2bProductsFilters.GlobalFilter[]): b2bProductsFilters.GlobalFilter[] {
        return globalFilters?.map(globalFilter => {
            return this.prepareFilterFromFilterSet(globalFitlerSetModels, globalFilter);
        });
    }

    private prepareFilterFromFilterSet(globalFitlerSetModels: b2bProductsFilters.GlobalFilterSetModel[], globalFilter: b2bProductsFilters.GlobalFilter): b2bProductsFilters.GlobalFilter {
        const globalFilterSetModel = globalFitlerSetModels?.find(globalFilterSetModel => globalFilterSetModel.filterType === globalFilter.filterType);

        switch (globalFilter.filterDisplayType) {
            case FilterDisplayType.MultipleChoiceList:
                globalFilter.selectedValue = this.multiChoiceFilterService.prepareFilterSelectedValuesFromValuesToSelect(globalFilter.values, globalFilterSetModel?.valueIds, Config.commonFilterValueIdPropertyName);
                break;
            case FilterDisplayType.SingleChoiceList:
                globalFilter.selectedValue = this.singleChoiceFilterService.prepareFilterSelectedValueFromValuesToSelect(globalFilter.values, globalFilterSetModel?.valueIds, Config.commonFilterValueIdPropertyName);
                break;
        }

        return globalFilter;
    }

    prepareSelectedFiltersValuesRequestModel(selectedFiltersValues: b2bProductsFilters.SelectedGlobalFilterValue[]): b2bProductsFilters.GlobalFilterRequestModel[] {
        return selectedFiltersValues?.map(selectedFilterValues => {
            return this.prepareSelectedFilterValuesRequestModel(selectedFilterValues);
        });
    }

    private prepareSelectedFilterValuesRequestModel(selectedFilterValues: b2bProductsFilters.SelectedGlobalFilterValue): b2bProductsFilters.GlobalFilterRequestModel {
        let valueIds: number[];

        switch (selectedFilterValues.filterDisplayType) {
            case FilterDisplayType.MultipleChoiceList:
                valueIds = this.multiChoiceFilterService.convertFilterSelectedValues<b2bProductsFilters.GlobalFilterValue, number>(<b2bProductsFilters.GlobalFilterValue[]>selectedFilterValues.selectedValue, Config.commonFilterValueIdPropertyName);
                break;
            case FilterDisplayType.SingleChoiceList:
                valueIds = this.singleChoiceFilterService.prepareFilterSelectedValues<b2bProductsFilters.GlobalFilterValue, number>(<b2bProductsFilters.GlobalFilterValue>selectedFilterValues.selectedValue, Config.commonFilterValueIdPropertyName)
                break;
        }

        return {
            filterType: selectedFilterValues.filterType,
            valueIds,
        };
    }
}
