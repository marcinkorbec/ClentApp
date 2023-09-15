import { Component, OnInit, ViewEncapsulation, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { b2bProductsFilters } from 'src/integration/products/b2b-products-filters';
import { Config } from 'src/app/helpers/config';
import { ProductsFiltersService } from '../../services/products-filters.service';
import { ProductsFiltersValuesService } from '../../services/products-filters-values.service';
import { FilterType } from '../../../../model/shared/enums/filter-type.enum';
import { UpdateProductsFilterSetService } from './../../services/update-products-filter-set.service';
import { UpdateFilterSetsExtraActionType } from 'src/app/model/product/enums/update-filter-sets-extra-action-type.enum';

@Component({
    selector: 'app-products-filters',
    templateUrl: './products-filters.component.html',
    styleUrls: ['./products-filters.component.scss'],
    host: { 'class': 'app-products-filters' },
    encapsulation: ViewEncapsulation.None
})
export class ProductsFiltersComponent implements OnInit, OnDestroy {

    private displayFiltersDialogSubscription: Subscription;
    private filtersChangedSubscription: Subscription;
    private filterSetsChangedSubscription: Subscription;

    private filterValueClearedSubscription: Subscription;
    private allFiltersValuesClearedSubscription: Subscription;
    private saveFiltersClickedSubscription: Subscription;
    private changeFilterSetNameClickedSubscription: Subscription;

    private filterSets: b2bProductsFilters.FilterSet[];
    visibleFilterSets: b2bProductsFilters.FilterSet[];
    activeFilterSetId: number;

    areFiltersSetsExpanded: boolean;
    isManagingVisibilityOfFilterSetsEnabled: boolean;

    filtersSummary: b2bProductsFilters.FiltersSummary;
    filtersForm: FormGroup;

    areMobileFiltersOpened: boolean;

    selectedFiltersValuesSummary: b2bProductsFilters.SelectedFiltersValuesSummary;

    @Input()
    translations: any;

    @Input()
    isMobile: boolean;

    @Output()
    filtersValuesChanged: EventEmitter<b2bProductsFilters.SelectedFiltersValuesSummary>;

    @Output()
    allFiltersValuesCleared: EventEmitter<b2bProductsFilters.FiltersSummary>;

    @Output()
    deletefilterSetClicked: EventEmitter<b2bProductsFilters.DeleteFilterSetRequestModel>;

    @Output()
    savefilterSetClicked: EventEmitter<b2bProductsFilters.SaveFiltersRequestModel>;

    @Output()
    changeFilterSetNameClicked: EventEmitter<b2bProductsFilters.FilterSetIdentifier>;

    constructor(
        private productsFiltersService: ProductsFiltersService,
        private productsFiltersValuesService: ProductsFiltersValuesService,
        private updateProductsFilterSetService: UpdateProductsFilterSetService) {

        this.filtersValuesChanged = new EventEmitter<b2bProductsFilters.SelectedFiltersValuesSummary>();
        this.allFiltersValuesCleared = new EventEmitter<b2bProductsFilters.FiltersSummary>();
        this.deletefilterSetClicked = new EventEmitter<b2bProductsFilters.DeleteFilterSetRequestModel>();
        this.savefilterSetClicked = new EventEmitter<b2bProductsFilters.SaveFiltersRequestModel>();
        this.changeFilterSetNameClicked = new EventEmitter<b2bProductsFilters.FilterSetIdentifier>();

        this.filtersForm = this.productsFiltersService.prepareEmptyForm();
    }

    ngOnInit() {
        this.displayFiltersDialogSubscription = this.productsFiltersService.displayFiltersDialog$.subscribe(this.openMobileFiltersDialog.bind(this));
        this.filtersChangedSubscription = this.productsFiltersService.filtersChanged$.subscribe(this.onFiltersChanged.bind(this));
        this.filterSetsChangedSubscription = this.productsFiltersService.filterSetsChanged$.subscribe(this.refreshFiltersAfterFilterSetsChanged.bind(this));

        this.filterValueClearedSubscription = this.productsFiltersValuesService.filterValueCleared$.subscribe(this.resetFilterValue.bind(this));
        this.allFiltersValuesClearedSubscription = this.productsFiltersValuesService.allFiltersValuesCleared$.subscribe(this.resetAllFiltersValues.bind(this));
        this.saveFiltersClickedSubscription = this.updateProductsFilterSetService.saveFiltersClicked$.subscribe(this.saveFilterSet.bind(this));
        this.changeFilterSetNameClickedSubscription = this.updateProductsFilterSetService.changeFilterSetNameClicked$.subscribe(this.changeFilterSetName.bind(this));
    }

    submitFilterValues() {
        this.resetActiveFilterSetSelection();
        this.updateFilterValues();
        this.filtersValuesChanged.emit(this.selectedFiltersValuesSummary);
    }

    private updateFilterValues() {
        const activeFilterSetIdentifier = this.prepareActiveFilterSetIdentifier();
        const filterValues = this.productsFiltersService.prepareSelectedFiltersValuesSummary(this.filtersForm.value, this.filtersSummary, activeFilterSetIdentifier);

        this.selectedFiltersValuesSummary = filterValues;
        this.productsFiltersValuesService.changeFiltersValues(filterValues);

        this.filtersForm.markAsPristine();
        this.closeMobileFiltersDialog();
    }

    private prepareActiveFilterSetIdentifier(): b2bProductsFilters.FilterSetIdentifier {
        const activeFilterSet = this.filterSets?.find(filterSet => filterSet.filterSetId === this.activeFilterSetId);
        if (activeFilterSet) {
            return { filterSetId: activeFilterSet.filterSetId, filterSetName: activeFilterSet.filterSetName };
        }

        return null;
    }

    private openMobileFiltersDialog() {
        this.areMobileFiltersOpened = true;
    }

    closeMobileFiltersDialog() {
        this.areMobileFiltersOpened = false;
    }

    resetFilterValue(resetFilterData: b2bProductsFilters.ResetFiltersValuesSummary) {
        const clearFilterValueModel = this.productsFiltersService.prepareClearFilterValueModel(this.filtersForm.value, resetFilterData);
        this.filtersForm.patchValue(clearFilterValueModel);

        this.submitFilterValues();
    }

    resetAllFiltersValues() {
        this.resetActiveFilterSetSelection();

        const filtersSummary = this.productsFiltersService.prepareClearAllFiltersSummary(this.filtersSummary);
        this.updateFilters(filtersSummary);

        this.allFiltersValuesCleared.emit(filtersSummary);
    }

    onFiltersChanged(filtersSummary: b2bProductsFilters.FiltersSummary) {
        this.resetActiveFilterSetSelection();
        this.updateFilters(filtersSummary);
    }

    private updateFilters(filtersSummary: b2bProductsFilters.FiltersSummary) {
        this.filtersSummary = filtersSummary;
        this.filtersForm = this.productsFiltersService.prepareFilterForm(filtersSummary);
        this.updateFilterValues();
    }

    private refreshFiltersAfterFilterSetsChanged(filterSetsSummary: b2bProductsFilters.FilterSetsSummary) {
        this.updateFilterSets(filterSetsSummary);

        switch (filterSetsSummary?.updateFilterSetsExtraActionType) {
            case UpdateFilterSetsExtraActionType.UpdateActiveFilterSet:
                this.updateFiltersByActiveFilterSet(filterSetsSummary);
                break;
            case UpdateFilterSetsExtraActionType.ResetActiveFilterSet:
                this.resetActiveFilterSetSelection();
                this.updateFilters(this.filtersSummary);
                break;
            default:
                this.updateFilters(this.filtersSummary);
                break;
        }
    }

    private updateFiltersByActiveFilterSet(filterSetsSummary: b2bProductsFilters.FilterSetsSummary) {
        const activeFilterSet = this.filterSets?.find(filterSet => filterSet.filterSetId === filterSetsSummary?.activeFilterSetId);

        if (activeFilterSet) {
            this.updateFiltersWithActiveFilterSet(activeFilterSet);
        } else {
            this.updateFilters(this.filtersSummary);
        }
    }

    private updateFiltersWithActiveFilterSet(activeFilterSet: b2bProductsFilters.FilterSet) {
        const isActiveFilterSetVisible = this.visibleFilterSets?.some(filterSet => filterSet.filterSetId === activeFilterSet?.filterSetId);
        if (!isActiveFilterSetVisible) {
            this.expandFilterSets();
        }

        this.updateFiltersByFilterSet(activeFilterSet);
    }

    private updateFilterSets(filterSetsSummary: b2bProductsFilters.FilterSetsSummary) {
        this.filterSets = filterSetsSummary?.filterSets;
        this.updateFilterSetsManagingVisability(filterSetsSummary?.filterSets);
        this.updateVisibleFilterSets(filterSetsSummary?.filterSets);
    }

    expandFilterSets() {
        this.areFiltersSetsExpanded = true;
        this.updateVisibleFilterSets(this.filterSets);
    }

    collapseFilterSets() {
        this.areFiltersSetsExpanded = false;
        this.updateVisibleFilterSets(this.filterSets);
    }

    private updateVisibleFilterSets(allFilterSets: b2bProductsFilters.FilterSet[]) {
        if (this.areFiltersSetsExpanded) {
            this.visibleFilterSets = allFilterSets;
        } else {
            this.visibleFilterSets = allFilterSets?.slice(0, Config.numberOfFilterSetsVisibleByDefault);
        }
    }

    private updateFilterSetsManagingVisability(allFilterSets: b2bProductsFilters.FilterSet[]) {
        if (allFilterSets?.length > Config.numberOfFilterSetsVisibleByDefault) {
            this.isManagingVisibilityOfFilterSetsEnabled = true;
        } else {
            this.isManagingVisibilityOfFilterSetsEnabled = false;
        }
    }

    checkIfPossibleToExpandFilter(filterType: FilterType, filterId: any) {
        if (!this.isMobile) {
            return false;
        }

        return this.productsFiltersService.checkIfPossibleToExpandFilter(filterType, filterId, this.selectedFiltersValuesSummary);
    }

    onClickFilterSet(filterSet: b2bProductsFilters.FilterSet) {
        if (!this.filtersSummary) {
            return;
        }

        if (this.activeFilterSetId === filterSet.filterSetId) {
            this.resetAllFiltersValues();
            return;
        }

        this.updateFiltersByFilterSet(filterSet);
        this.filtersValuesChanged.emit(this.selectedFiltersValuesSummary);
    }

    private updateFiltersByFilterSet(filterSet: b2bProductsFilters.FilterSet) {
        this.activeFilterSetId = filterSet.filterSetId;
        const summary = this.productsFiltersService.prepareFiltersSummaryFromFilterSet(filterSet, { ...this.filtersSummary });
        this.updateFilters(summary);
    }

    isFilterSetTooltipDisabled(filterSetName: string) {
        return filterSetName?.length < Config.filterSetMinLengthToShowTooltip;
    }

    private resetActiveFilterSetSelection() {
        this.activeFilterSetId = null;
    }

    onClickDeleteFilterSet(filterSet: b2bProductsFilters.FilterSet) {
        const extraAction = filterSet?.filterSetId === this.activeFilterSetId ? UpdateFilterSetsExtraActionType.ResetActiveFilterSet : UpdateFilterSetsExtraActionType.None;
        const deleteRequest = this.prepareDeleteFilterSetRequestModel(filterSet, extraAction);

        this.deletefilterSetClicked.emit(deleteRequest);
    }

    private prepareDeleteFilterSetRequestModel(filterSet: b2bProductsFilters.FilterSet, updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType): b2bProductsFilters.DeleteFilterSetRequestModel {
        const filterSetIdentifier = { filterSetId: filterSet.filterSetId, filterSetName: filterSet.filterSetName };
        return { filterSetIdentifier, updateFilterSetsExtraActionType };
    }

    saveFilterSet(requestModel: b2bProductsFilters.SaveFiltersRequestModel) {
        this.savefilterSetClicked.emit(requestModel);
    }

    changeFilterSetName(newFilterSetIdentifier: b2bProductsFilters.FilterSetIdentifier) {
        this.changeFilterSetNameClicked.emit(newFilterSetIdentifier);
    }

    ngOnDestroy(): void {
        if (this.displayFiltersDialogSubscription) {
            this.displayFiltersDialogSubscription.unsubscribe();
        }

        if (this.filtersChangedSubscription) {
            this.filtersChangedSubscription.unsubscribe();
        }

        if (this.filterSetsChangedSubscription) {
            this.filterSetsChangedSubscription.unsubscribe();
        }

        if (this.filterValueClearedSubscription) {
            this.filterValueClearedSubscription.unsubscribe();
        }

        if (this.allFiltersValuesClearedSubscription) {
            this.allFiltersValuesClearedSubscription.unsubscribe();
        }

        if (this.saveFiltersClickedSubscription) {
            this.saveFiltersClickedSubscription.unsubscribe();
        }

        if (this.changeFilterSetNameClickedSubscription) {
            this.changeFilterSetNameClickedSubscription.unsubscribe();
        }
    }
}
