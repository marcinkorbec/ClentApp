import { GlobalFilterType } from '../../app/model/shared/enums/global-filter-type.enum';
import { FilterDisplayType } from '../../app/model/shared/enums/filter-display-type.enum';
import { FilterSetModalStatus } from '../../app/model/product/enums/filter-set-modal-status.enum';
import { UpdateFilterSetsExtraActionType } from '../../app/model/product/enums/update-filter-sets-extra-action-type.enum';

export module b2bProductsFilters {

    interface FilterBase {
        filterName: string;
    }

    interface ArticleGroupFilter extends FilterBase {
        filterId: number;
        values: ArticleGroupFilterValue[];
        defaultValue?: Partial<ArticleGroupFilterValue | ArticleGroupFilterValue[]>;
        selectedValue?: Partial<ArticleGroupFilterValue | ArticleGroupFilterValue[]>;
    }

    interface GlobalFilter extends FilterBase {
        filterType: GlobalFilterType;
        filterDisplayType: FilterDisplayType;
        values: GlobalFilterValue[];
        defaultValue?: Partial<GlobalFilterValue | GlobalFilterValue[]>;
        selectedValue?: Partial<GlobalFilterValue | GlobalFilterValue[]>;
    }

    interface BaseFilterValue {
        id: number;
        translatedName: string;
    }

    interface GlobalFilterValue extends BaseFilterValue { }
    interface ArticleGroupFilterValue extends BaseFilterValue { }

    interface FiltersSummary {
        articleGroupFilters: ArticleGroupFilter[];
        globalFilters: GlobalFilter[];
    }

    interface SelectedArticleGroupFilterValue extends ArticleGroupFilter {
        selectedValue: Partial<ArticleGroupFilterValue | ArticleGroupFilterValue[]>;
        selectedValueToShow: Partial<ArticleGroupFilterValue | ArticleGroupFilterValue[]>;
    }

    interface SelectedGlobalFilterValue extends GlobalFilter {
        selectedValue: Partial<GlobalFilterValue | GlobalFilterValue[]>;
        selectedValueToShow: Partial<GlobalFilterValue | GlobalFilterValue[]>;
    }

    interface SelectedFiltersValuesSummary {
        articleGroupFiltersValues: SelectedArticleGroupFilterValue[];
        globalFiltersValues: SelectedGlobalFilterValue[];
        haveAnySelectedFiltersValuesToShow: boolean;
        haveAnySelectedFiltersValues: boolean;
        activeFilterSet?: FilterSetIdentifier;
    }

    interface ResetArticleGroupFilterValueModel {
        selectedFilterValue: SelectedArticleGroupFilterValue;
        valueToReset: ArticleGroupFilterValue;
    }

    interface ResetGlobalFilterValueModel {
        selectedFilterValue: SelectedGlobalFilterValue;
        valueToReset: GlobalFilterValue;
    }

    interface ResetFiltersValuesSummary {
        resetArticleGroupFilterValue?: ResetArticleGroupFilterValueModel;
        resetGlobalFilterValue?: ResetGlobalFilterValueModel;
    }

    interface FilterSetIdentifier {
        filterSetId?: number;
        filterSetName: string;
    }

    interface FilterSet extends FilterSetIdentifier{
        globalFilters: GlobalFilterSetModel[];
        articleGroupFilters: ArticleGroupFilterSetModel[];
    }

    interface FilterSetsSummary {
        filterSets: FilterSet[];
        updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType;
        activeFilterSetId?: number;
    }

    interface GlobalFilterSetModel {
        filterType: GlobalFilterType;
        valueIds: number[];
    }

    interface ArticleGroupFilterSetModel {
        filterId: number;
        valueIds: number[];
    }

    interface FilterSetBaseModalData {
        isOpened: boolean;
        filterSetIdentifier?: FilterSetIdentifier;
        autoClose: boolean;
        autoCloseTimeout?: number;
    }

    interface FilterSetNotificationModalData extends FilterSetBaseModalData {
        filterSetModalStatus?: FilterSetModalStatus;
    }

    interface ConfirmDeleteFilterSetModalData extends FilterSetBaseModalData  {
        updateFilterSetsExtraActionType?: UpdateFilterSetsExtraActionType;
    }

    interface FilterSetActionStatus {
        filterSetIdentifier: FilterSetIdentifier;
        filterSetModalStatus: FilterSetModalStatus;
    }
    interface SaveFiltersRequestModel {
        filterSetName: string;
        globalFilters: GlobalFilterRequestModel[],
        articleGroupFilters: ArticleGroupFilterRequestModel[];
    }

    interface GlobalFilterRequestModel {
        filterType: GlobalFilterType;
        valueIds: numer[];
    }

    interface ArticleGroupFilterRequestModel {
        filterId: number;
        valueIds: numer[];
    }

    interface DeleteFilterSetRequestModel {
        filterSetIdentifier: FilterSetIdentifier;
        updateFilterSetsExtraActionType: UpdateFilterSetsExtraActionType;
    }

    interface PerformFilterSetActionSummary {
        actionStatus?: FilterSetActionStatus;
        filterSetsSummary?: FilterSetsSummary;
    }
}
