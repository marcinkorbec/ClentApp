import { ProductSortMode } from 'src/app/model/product/enums/products-sort-mode.enum';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { b2bProducts } from 'src/integration/products/b2b-products';
import { ProductSortingAccuracyVisibility } from 'src/app/model/product/enums/product-sorting-accuracy-visibility.enum';


@Injectable()
export class ProductsSortingService {

    private _sortModeUpdated: BehaviorSubject<b2bProducts.ChangeSortModeData>;
    sortModeUpdated$: Observable<b2bProducts.ChangeSortModeData>;

    constructor() {
        this._sortModeUpdated = new BehaviorSubject(null);
        this.sortModeUpdated$ = this._sortModeUpdated.asObservable();
    }

    updateSorting(sortMode: ProductSortMode, accuracyOptionVisibility: ProductSortingAccuracyVisibility = ProductSortingAccuracyVisibility.NoChange) {
        const data: b2bProducts.ChangeSortModeData = { sortMode, accuracyOptionVisibility };
        this._sortModeUpdated.next(data);
    }

    updateStorageSortModeIfPossible(sortMode: ProductSortMode) {
        if (!(sortMode in ProductSortMode)) {
            return console.warn(`Sort mode cannot be changed to '${sortMode}' because it is not defined in the list of available sort modes`);
        }

        if (sortMode !== ProductSortMode.Accuracy) {
            localStorage.setItem('sortMode', sortMode);
        }
    }
}
