import { Injectable } from '@angular/core';
import { FormBuilder, FormArray } from '@angular/forms';
import { Config } from '../../../helpers/config';


@Injectable()
export class MultiChoiceFilterService {

    constructor(private formBuilder: FormBuilder) { }

    prepareFilterFormArray<T>(selectedValues: T[], defaultValues: T[], allValues: T[], filterValuePropertyName?: string): FormArray {
        const selectedValuesIndexes = this.prepareSelectedValuesIndexes(selectedValues, defaultValues, allValues, filterValuePropertyName);
        return this.prepareFormArray(allValues.length, selectedValuesIndexes);
    }

    prepareSelectedFiltersValues<T>(filterFormValues: any[], allFilterValues: T[]): T[] {
        if (!filterFormValues || filterFormValues.length === 0 || !allFilterValues || allFilterValues.length === 0) {
            return null;
        }

        const selectedValues = filterFormValues
            .map((checked, i) => checked ? allFilterValues[i] : null)
            .filter(item => item);

        if (!selectedValues || selectedValues.length === 0) {
            return null;
        }

        return selectedValues;
    }

    prepareFiltersValuesToShow<T>(selectedValues: T[]): T[] {
        return selectedValues; //TODO implement logic with defaultValues if is necessary
    }

    prepareClearFilterValueModel<T>(filterFormValues: any[], valueToReset: T, allValues: T[], defaultValues: T[], filterPropertyName: string, filterValuePropertyName?: string) {
        if (!valueToReset || !allValues || allValues.length === 0) {
            return { [filterPropertyName]: filterFormValues };
        }

        let valueIndex: number;
        if (filterValuePropertyName) {
            valueIndex = allValues.findIndex(value => value[filterValuePropertyName] === valueToReset[filterValuePropertyName]);
        } else {
            valueIndex = allValues.findIndex(value => value === valueToReset);
        }

        const defaultValuesIndexes = this.prepareSelectedValuesIndexes(null, defaultValues, allValues, filterValuePropertyName);
        filterFormValues[valueIndex] = this.isValueSetByDefault(valueIndex, defaultValuesIndexes);

        return { [filterPropertyName]: filterFormValues };
    }

    checkIfHaveAnySelectedFilterValuesToShow<T>(selectedValuesToShow: T[]): boolean {
        return selectedValuesToShow && selectedValuesToShow.length > 0;
    }

    checkIfHaveAnySelectedFilterValues<T>(selectedValues: T[]): boolean {
        return selectedValues && selectedValues.length > 0;
    }

    private prepareSelectedValuesIndexes<T>(selectedValues: T[], defaultValues: T[], allValues: T[], filterValuePropertyName?: string): number[] {
        if (selectedValues && selectedValues.length > 0) {
            return this.prepareValuesIndexes(selectedValues, allValues, filterValuePropertyName);
        }

        if (defaultValues && defaultValues.length > 0) {
            return this.prepareValuesIndexes(defaultValues, allValues, filterValuePropertyName);
        }

        return null;
    }

    private prepareValuesIndexes<T>(values: T[], allValues: T[], filterValuePropertyName: string) {
        const valuesIndexes: number[] = [];
        values.forEach(defaultValue => {
            let index: number;
            if (filterValuePropertyName) {
                index = allValues.findIndex(value => value[filterValuePropertyName] === defaultValue[filterValuePropertyName]);
            } else {
                index = allValues.findIndex(value => value === defaultValue);
            }

            if (index !== Config.notFoundIndex) {
                valuesIndexes.push(index);
            }
        });

        return valuesIndexes;
    }

    private prepareFormArray(length: number, defaultValuesIndexes: number[]) {
        const arrayValues = [...Array(length)].map((item, i) => this.isValueSetByDefault(i, defaultValuesIndexes));
        return this.formBuilder.array(arrayValues);
    }

    private isValueSetByDefault(valueIndex: number, defaultValuesIndexes: number[]) {
        return defaultValuesIndexes && defaultValuesIndexes.includes(valueIndex) ? true : false;
    }

    prepareFilterSelectedValuesFromValuesToSelect<TFilterValue, TValueToSelect>(filterValues: TFilterValue[], valuesToSelect: TValueToSelect[], filterValuePropertyName?: string, valueToSelectPropertyName?: string): TFilterValue[] {
        if (!filterValues || filterValues.length === 0 || !valuesToSelect || valuesToSelect.length === 0) {
            return null;
        }

        if (filterValuePropertyName) {
            if (valueToSelectPropertyName) {
                return filterValues.filter(value => valuesToSelect.some(valueToSelect => valueToSelect[valueToSelectPropertyName] === value[filterValuePropertyName]));
            } else {
                return filterValues.filter(value => valuesToSelect.some(valueToSelect => valueToSelect === value[filterValuePropertyName]));
            }
        } else {
            if (valueToSelectPropertyName) {
                return filterValues.filter(value => valuesToSelect.some(valueToSelect => valueToSelect[valueToSelectPropertyName] === value));
            } else {
                return filterValues.filter(value => valuesToSelect.some(valueToSelect => valueToSelect === value as any));
            }
        }
    }

    convertFilterSelectedValues<TFilterValue, TValue>(selectedFilterValues: TFilterValue[], filterValuePropertyName: string): TValue[] {
        if (!selectedFilterValues || selectedFilterValues.length === 0) {
            return null;
        }

        if (filterValuePropertyName) {
            return selectedFilterValues.map(selectedValue => selectedValue[filterValuePropertyName]);
        } else {
            return selectedFilterValues as any;
        }
    }
}
