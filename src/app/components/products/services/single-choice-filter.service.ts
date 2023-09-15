import { Injectable } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';


@Injectable()
export class SingleChoiceFilterService {

    constructor(private formBuilder: FormBuilder) { }

    prepareFilterFormControl<T>(selectedValue: T, defaultValue: T, filterValuePropertyName?: string): FormControl {
        const initValue = this.prepareInitValue(selectedValue, defaultValue, filterValuePropertyName);
        return this.formBuilder.control(initValue);
    }

    prepareSelectedFilterValue<T>(filterFormValue: any, allFilterValues: T[], filterValuePropertyName?: string): T {
        if (!allFilterValues || allFilterValues.length === 0) {
            return null;
        }

        let selectedValue: T;
        if (filterValuePropertyName) {
            selectedValue = allFilterValues.find(value => value[filterValuePropertyName] === filterFormValue);
        } else {
            selectedValue = allFilterValues.find(value => value === filterFormValue);
        }

        return selectedValue;
    }

    prepareFiltersValuesToShow<T>(selectedValue: T, defaultValue: T, filterValuePropertyName?: string): T {
        if (!defaultValue) {
            return selectedValue;
        }

        let valueToShow: T;
        if (filterValuePropertyName) {
            valueToShow = defaultValue[filterValuePropertyName] !== selectedValue[filterValuePropertyName] ? selectedValue : null;
        } else {
            valueToShow = defaultValue !== selectedValue ? selectedValue : null;
        }

        return valueToShow;
    }

    prepareClearFilterValueModel<T>(filterPropertyName: string, defaultValue: T, filterValuePropertyName?: string) {
        const initValue = this.prepareInitValue(null, defaultValue, filterValuePropertyName);
        return { [filterPropertyName]: initValue };
    }

    checkIfHaveAnySelectedFilterValuesToShow<T>(selectedValueToShow: T): boolean {
        return selectedValueToShow ? true : false;
    }

    checkIfHaveAnySelectedFilterValues<T>(selectedValue: T): boolean {
        return selectedValue ? true : false;
    }

    private prepareInitValue<T>(selectedValue: T, defaultValue: T, filterValuePropertyName?: string) {
        if (selectedValue) { //TODO what if selectedValues is just a '0'?
            return this.prepareValue(selectedValue, filterValuePropertyName);
        }

        if (defaultValue) { //TODO what if defaultValue is just a '0'?
            return this.prepareValue(defaultValue, filterValuePropertyName);
        }

        return null;
    }

    private prepareValue<T>(value: T, filterValuePropertyName: string) {
        if (filterValuePropertyName) {
            return value[filterValuePropertyName];
        } else {
            return value;
        }
    }

    prepareFilterSelectedValueFromValuesToSelect<TFilterValue, TValueToSelect>(filterValues: TFilterValue[], valuesToSelect: TValueToSelect[], filterValuePropertyName?: string, valueToSelectPropertyName?: string): TFilterValue {
        if (!filterValues || filterValues.length === 0 || !valuesToSelect || valuesToSelect.length === 0) {
            return null;
        }

        let filteredValues: TFilterValue[];

        if (filterValuePropertyName) {
            if (valueToSelectPropertyName) {
                filteredValues = filterValues.filter(value => valuesToSelect.some(valueToSelect => valueToSelect[valueToSelectPropertyName] === value[filterValuePropertyName]));
            } else {
                filteredValues = filterValues.filter(value => valuesToSelect.some(valueToSelect => valueToSelect === value[filterValuePropertyName]));
            }
        } else {
            if (valueToSelectPropertyName) {
                filteredValues = filterValues.filter(value => valuesToSelect.some(valueToSelect => valueToSelect[valueToSelectPropertyName] === value));
            } else {
                filteredValues = filterValues.filter(value => valuesToSelect.some(valueToSelect => valueToSelect === value as any));
            }
        }

        if (filteredValues?.length === 1) {
            return filteredValues[0];
        } else {
            return null;
        }
    }

    prepareFilterSelectedValues<TFilterValue, TValue>(selectedFilterValue: TFilterValue, filterValuePropertyName: string): TValue[] {
        const selectedValue = this.convertFilterSelectedValue<TFilterValue, TValue>(selectedFilterValue, filterValuePropertyName);
        if (!selectedValue && (selectedValue as any) !== 0) {
            return null;
        }

        return [selectedValue] as TValue[];
    }

    convertFilterSelectedValue<TFilterValue, TValue>(selectedFilterValue: TFilterValue, filterValuePropertyName: string): TValue {
        if (filterValuePropertyName) {
            return selectedFilterValue?.[filterValuePropertyName];
        } else {
            return selectedFilterValue as any;
        }
    }
}
