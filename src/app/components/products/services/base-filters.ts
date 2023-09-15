import { FormGroup } from '@angular/forms';


export abstract class BaseFilters {

    prepareEmptyFormGroup() {
        return new FormGroup({});
    }

    prepareClearAllFilters<T>(filters: T[], selectedFilterValuePropertyName: string, selectedFilterValueToShowPropertyName: string) {
        if (!filters || filters.length === 0) {
            return null;
        }

        filters.forEach(filter => {
            filter[selectedFilterValuePropertyName] = null;
            filter[selectedFilterValueToShowPropertyName] = null;
        });

        return filters;
    }
}
