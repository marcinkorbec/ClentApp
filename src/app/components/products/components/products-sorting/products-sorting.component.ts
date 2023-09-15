import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { b2bProducts } from "src/integration/products/b2b-products";
import { ProductSortMode } from "src/app/model/product/enums/products-sort-mode.enum";
import { ProductsSortingService } from "../../services/products-sorting.service";
import { UnsubscribeComponent } from "src/app/components/common/unsubscribe.component";
import { ProductSortingAccuracyVisibility } from "src/app/model/product/enums/product-sorting-accuracy-visibility.enum";

@Component({
    selector: "app-products-sorting",
    templateUrl: "./products-sorting.component.html",
    styleUrls: ["./products-sorting.component.scss"],
    host: { class: "app-products-sorting" },
    encapsulation: ViewEncapsulation.None,
})
export class ProductsSortingComponent extends UnsubscribeComponent implements OnInit {
    isSortingDropOpened: boolean;

    activeSortingOption: b2bProducts.SortingOption;

    sortingOptions: b2bProducts.SortingOption[];

    @Input()
    translations: any;

    @Output()
    sortingModeChanged: EventEmitter<ProductSortMode>;

    constructor(private productsSortingService: ProductsSortingService) {
        super();
        this.sortingModeChanged = new EventEmitter();
    }

    ngOnInit(): void {
        this.sortingOptions = this.prepareSortingOptions();
        this.registerSub(this.productsSortingService.sortModeUpdated$.subscribe(this.onSortModeUpdated.bind(this)));
    }

    private onSortModeUpdated(data: b2bProducts.ChangeSortModeData) {
        this.productsSortingService.updateStorageSortModeIfPossible(data.sortMode);
        this.updateActiveSortingOption(data.sortMode);

        this.updateAccuracySortingOptionVisiblity(data.accuracyOptionVisibility);
    }

    private updateAccuracySortingOptionVisiblity(accuracyOptionVisibility: ProductSortingAccuracyVisibility) {
        if (accuracyOptionVisibility === ProductSortingAccuracyVisibility.NoChange) {
            return;
        }

        this.sortingOptions = this.sortingOptions?.map(option => {
            if (option.value === ProductSortMode.Accuracy) {
                option.isVisible = accuracyOptionVisibility === ProductSortingAccuracyVisibility.Visible;
            }

            return option;
        });
    }

    private updateActiveSortingOption(sortMode: ProductSortMode) {
        this.activeSortingOption = this.sortingOptions.find(option => option.value === sortMode);
    }

    onOpenSortingDrop() {
        this.isSortingDropOpened = true;
    }

    onClickSortingOption(sortingOption: b2bProducts.SortingOption) {
        this.productsSortingService.updateStorageSortModeIfPossible(sortingOption.value);
        this.updateActiveSortingOption(sortingOption.value);
        this.closeSortingDropDown();

        this.sortingModeChanged.emit(sortingOption.value);
    }

    closeSortingDropDown() {
        this.isSortingDropOpened = false;
    }

    private prepareSortingOptions(): b2bProducts.SortingOption[] {
        return [
            {
                translatedName: this.translations?.accuracy,
                value: ProductSortMode.Accuracy,
                isVisible: false,
            },
            {
                translatedName: this.translations?.productNameAsc,
                value: ProductSortMode.NameAsc,
                isVisible: true,
            },
            {
                translatedName: this.translations?.productNameDesc,
                value: ProductSortMode.NameDesc,
                isVisible: true,
            },
            {
                translatedName: this.translations?.productCodeAsc,
                value: ProductSortMode.CodeAsc,
                isVisible: true,
            },
            {
                translatedName: this.translations?.productCodeDesc,
                value: ProductSortMode.CodeDesc,
                isVisible: true,
            },
            {
                translatedName: this.translations?.latest,
                value: ProductSortMode.Latest,
                isVisible: true,
            },
        ];
    }
}
