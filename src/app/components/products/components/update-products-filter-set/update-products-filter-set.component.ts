import { Subscription } from 'rxjs';
import { Component, OnInit, ViewEncapsulation, OnDestroy, Input, ViewChild } from '@angular/core';
import { Config } from 'src/app/helpers/config';
import { FilterSetViewType } from 'src/app/model/product/enums/fitler-set-view-type.enum';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { UpdateProductsFilterSetService } from '../../services/update-products-filter-set.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-update-products-filter-set',
    templateUrl: './update-products-filter-set.component.html',
    styleUrls: ['./update-products-filter-set.component.scss'],
    host: { 'class': 'update-products-filter-set' },
    encapsulation: ViewEncapsulation.None
})
export class UpdateProductsFilterSetComponent implements OnInit, OnDestroy {

    private filterSetFormChangedSubscription: Subscription;

    maxFitlerSetNameLength: number;

    selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary;
    saveFilterViewType: FilterSetViewType;

    @ViewChild('filterSetNameForm') filterSetNameForm: NgForm;

    @Input()
    translations: any;

    constructor(private updateProductsFilterSetService: UpdateProductsFilterSetService) {
        this.maxFitlerSetNameLength = Config.maxFilterSetNameLength;
    }

    ngOnInit() {
        this.filterSetFormChangedSubscription = this.updateProductsFilterSetService.filterSetFormChanged$.subscribe(this.updateFilterSetForm.bind(this));
    }

    private updateFilterSetForm(selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        this.selectedFiltersSummary = selectedFiltersSummary;
        this.updateFilterSetViewType(selectedFiltersSummary);
    }

    openSaveFilterSetForm() {
        this.saveFilterViewType = FilterSetViewType.SaveFilterSetForm;
    }

    openChangeFilterSetnameForm() {
        this.saveFilterViewType = FilterSetViewType.ChangeFitlerSetName;
    }

    cancelSaveFilterForm() {
        this.updateFilterSetViewType(this.selectedFiltersSummary);
    }

    private updateFilterSetViewType(selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        if (!selectedFiltersSummary?.haveAnySelectedFiltersValuesToShow) {
            this.saveFilterViewType = FilterSetViewType.None;
            return;
        }

        this.saveFilterViewType = selectedFiltersSummary?.activeFilterSet ? FilterSetViewType.ActiveButton : FilterSetViewType.SaveButton;
    }

    onClickSave(filterSetName: string, saveFilterViewType: FilterSetViewType, selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        if (!this.filterSetNameForm.valid) {
            this.filterSetNameForm.controls['newFilterSetName'].markAsDirty();
            return;
        }

        switch (saveFilterViewType) {
            case FilterSetViewType.ChangeFitlerSetName:
            return this.changeFilterSetName(filterSetName, selectedFiltersSummary.activeFilterSet);

            case FilterSetViewType.SaveFilterSetForm:
                return this.saveFilters(filterSetName, selectedFiltersSummary);
        }
    }

    private changeFilterSetName(filterSetName: string, activeFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        const newFilterSetIdentifier = {
            ...activeFilterSetIdentifier,
            filterSetName
        };

        this.updateProductsFilterSetService.changeFilterSetName(newFilterSetIdentifier);
    }

    private saveFilters(filterSetName: string, selectedFiltersSummary: b2bProductsFilters.SelectedFiltersValuesSummary) {
        this.updateProductsFilterSetService.saveFilters(filterSetName, selectedFiltersSummary);
    }

    ngOnDestroy(): void {
        if (this.filterSetFormChangedSubscription) {
            this.filterSetFormChangedSubscription.unsubscribe();
        }
    }
}
