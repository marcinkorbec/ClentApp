import { Component, OnInit, ViewEncapsulation, Input, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Config } from 'src/app/helpers/config';
import { FilterSetViewType } from 'src/app/model/product/enums/fitler-set-view-type.enum';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { ProductsFiltersValuesService } from '../../services/products-filters-values.service';
import { UpdateProductsFilterSetService } from './../../services/update-products-filter-set.service';

@Component({
    selector: 'app-product-filters-values',
    templateUrl: './product-filters-values.component.html',
    styleUrls: ['./product-filters-values.component.scss'],
    host: { 'class': 'app-product-filters-values' },
    encapsulation: ViewEncapsulation.None
})
export class ProductFiltersValuesComponent implements OnInit, OnDestroy {

    private filtersValuesChangedSubscription: Subscription;

    selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary;

    saveFilterViewType: FilterSetViewType;
    maxFitlerSetNameLength: number;

    @ViewChild('filterSetNameForm') filterSetNameForm: NgForm;

    @Input()
    translations: any;

    @Input()
    isMobile: boolean;

    @Input()
    searchPhrase: string;

    @Output()
    searchResultCleared: EventEmitter<void>;

    constructor(
        private productsFiltersValuesService: ProductsFiltersValuesService,
        private updateProductsFilterSetService: UpdateProductsFilterSetService) {

        this.searchResultCleared = new EventEmitter<void>();
        this.maxFitlerSetNameLength = Config.maxFilterSetNameLength;
    }

    ngOnInit() {
        this.filtersValuesChangedSubscription = this.productsFiltersValuesService.filtersValuesChanged$.subscribe(this.updateFiltersValues.bind(this));
    }

    private updateFiltersValues(selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        this.selectedFiltersSummary = selectedFiltersSummary;
        this.updateProductsFilterSetService.updateFilterSetForm(selectedFiltersSummary);
    }

    resetArticleGroupFilterValue(valueToReset: b2bProductsFilters.ArticleGroupFilterValue, selectedFilter: b2bProductsFilters.SelectedArticleGroupFilterValue) {
        this.productsFiltersValuesService.resetArticleGroupFilterValue(valueToReset, selectedFilter);
    }

    resetGlobalFilterValue(valueToReset: b2bProductsFilters.GlobalFilterValue, selectedFilter: b2bProductsFilters.SelectedGlobalFilterValue) {
        this.productsFiltersValuesService.resetGlobalFilterValue(valueToReset, selectedFilter);
    }

    resetAllFiltersValues() {
        this.productsFiltersValuesService.resetAllFiltersValues();
    }

    resetSearchResults() {
        this.searchResultCleared.emit();
    }

    ngOnDestroy(): void {
        this.filtersValuesChangedSubscription.unsubscribe();
    }
}
