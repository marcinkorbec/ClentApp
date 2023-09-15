import { b2bShared } from 'src/integration/b2b-shared';
import { b2bProductDetails } from 'src/integration/b2b-product-details';
import { ProductStatus } from '../../app/model/product/enums/product-status.enum';
import { b2bProductsFilters } from './b2b-products-filters';
import { StockLevelFilterType } from '../../app/model/shared/enums/stock-level-filter-type.enum';
import { FilterType } from 'src/app/model/shared/enums/filter-type.enum';
import { GlobalFilterType } from 'src/app/model/shared/enums/global-filter-type.enum';
import { ProductDetailsType } from 'src/app/model/product/enums/product-details-type.enum';
import { ProductSortMode } from 'src/app/model/product/enums/products-sort-mode.enum';
import { ProductSortingAccuracyVisibility } from 'src/app/model/product/enums/product-sorting-accuracy-visibility.enum';

export module b2bProducts {

    //------Requests

    interface GetSuggestionsBaseRequest {
        filter: string;
        groupId: number;
    }

    interface GetSuggestionsXlRequest extends GetSuggestionsBaseRequest { }
    interface GetSuggestionsAltumRequest extends GetSuggestionsBaseRequest { }

    interface GetArticleListBaseRequest {
        groupId: number;
        onlyAvailable: boolean;
        filterInGroup: boolean; //TODO always false - temp solution
        pageNumber: number;
        filter?: string;
        stockLevelFilter: StockLevelFilterType;
        warehouseId: number;
        sortMode: ProductSortMode;
    }

    interface GetArticleFromListBaseRequest {
        articleId: number;
        warehouseId: number;
    }

    interface GetArticleGroupFiltersBaseRequest {
        groupId: number;
    }

    interface GetArticleGroupFiltersXlRequest extends GetArticleGroupFiltersBaseRequest { }
    interface GetArticleGroupFiltersAltumRequest extends GetArticleGroupFiltersBaseRequest { }

    interface FiltersRequestObject {
        filterId: number;
        values: string[];
    }

    interface GetArticleListWithGroupFiltersBaseRequest {
        groupId: number;
        onlyAvailable: boolean;
        pageNumber: number;
        stockLevelFilter: StockLevelFilterType;
        warehouseId: number;
        filters: FiltersRequestObject[];
        sortMode: ProductSortMode;
    }

    interface GetArticleListWithGroupFiltersXlRequest extends GetArticleListWithGroupFiltersBaseRequest { }
    interface GetArticleListWithGroupFiltersAltumRequest extends GetArticleListWithGroupFiltersBaseRequest { }


    interface GetFilterSetsBaseRequest {
        groupId: number;
    }

    interface GetFilterSetsXlRequest extends GetFilterSetsBaseRequest { }
    interface GetFilterSetsAltumRequest extends GetFilterSetsBaseRequest { }

    interface DeleteFilterSetBaseRequest {
        filterSetId: number;
    }

    interface DeleteFilterSetXlRequest extends DeleteFilterSetBaseRequest { }
    interface DeleteFilterSetAltumRequest extends DeleteFilterSetBaseRequest { }

    interface AddFilterSetBaseRequest {
        groupId: number;
        filterSetName: string;
        globalFilters: b2bProductsFilters.GlobalFilterRequestModel[];
        articleGroupFilters: b2bProductsFilters.ArticleGroupFilterRequestModel[];
    }

    interface AddFilterSetXlRequest extends AddFilterSetBaseRequest { }
    interface AddFilterSetAltumRequest extends AddFilterSetBaseRequest { }

    interface UpdateFilterSetNameBaseRequest {
        filterSetId: number;
        newFilterSetName: string;
    }

    interface UpdateFilterSetNameXlRequest extends UpdateFilterSetNameBaseRequest { }
    interface UpdateFilterSetNameAltumRequest extends UpdateFilterSetNameBaseRequest { }


    //------Responses


    interface GetSuggestionsBaseResponse {
        suggestions: SuggestionBase[];
    }
    interface GetSuggestionsXlResponse {
        suggestions: SuggestionXl[];
    }
    interface GetSuggestionsAltumResponse {
        suggestions: SuggestionAltum[];
    }


    interface GetArticleListBaseResponse {
        paging: b2bShared.PaginationResponse;
        articleList: ArticleListItemBase[];
    }

    interface GetArticleListXlResponse extends GetArticleListBaseResponse {
        articleList: ArticleListItemXl[];
    }

    interface GetArticleListAltumResponse extends GetArticleListBaseResponse {
        articleList: ArticleListItemAltum[];
    }

    interface GetArticleFromListBaseResponse extends b2bProductDetails.ProductPurchaseDetailsBase {
        thresholdPriceLists: b2bProductDetails.GetThresholdPriceListBaseResponse;
        itemExistsInCurrentPriceList: boolean;
        articleDetailsType: ProductDetailsType;
    }

    interface GetArticleFromListXlResponse extends GetArticleFromListBaseResponse, b2bProductDetails.ProductPurchaseDetailsXl {
        thresholdPriceLists: b2bProductDetails.GetThresholdPriceListXlResponse;
    }

    interface GetArticleFromListAltumResponse extends GetArticleFromListBaseResponse, b2bProductDetails.ProductPurchaseDetailsAltum {
        thresholdPriceLists: b2bProductDetails.GetThresholdPriceListAltumResponse;
    }

    interface GetArticleGroupFiltersBaseResponse {
        filtersPerArticleGroup: b2bProductsFilters.ArticleGroupFilter[];
    }

    interface GetArticleGroupFiltersXlResponse extends GetArticleGroupFiltersBaseResponse { }
    interface GetArticleGroupFiltersAltumResponse extends GetArticleGroupFiltersBaseResponse { }


    interface GetFilterSetsBaseResponse {
        filterSets: b2bProductsFilters.FilterSet[]
    }

    interface GetFilterSetsXlResponse extends GetFilterSetsBaseResponse { }
    interface GetFilterSetsAltumResponse extends GetFilterSetsBaseResponse { }

    interface GetUnitResponse {
        articleUnitList: articleUnitList[]
    }

    interface AddFilterSetBaseResponse {
        savedFilterSet: b2bProductsFilters.FilterSet;
    }

    interface AddFilterSetXlResponse extends AddFilterSetBaseResponse { }
    interface AddFilterSetAltumResponse extends AddFilterSetBaseResponse { }

    //-----Other

    interface SuggestionBase {
        article: b2bShared.ArticleBase;
    }
    interface SuggestionXl extends SuggestionBase {
        article: b2bShared.ArticleXl;
    }
    interface SuggestionAltum extends SuggestionBase {
        article: b2bShared.ArticleAltum;
    }

    interface SearchArticlesData {
        searchValue?: string;
        suggestions?: SuggestionBase[];
    }

    interface ArticleListItemBase {
        rowNumber: number;
        status: ProductStatus;
        article: b2bShared.ArticleBase;
        extensions: b2bShared.ApiObjectExtension;
        objectExtension: b2bShared.ApiObjectExtensionOld;
    }

    interface ArticleListItemXl extends ArticleListItemBase {
        flag: number;
        article: b2bShared.ArticleXl;
    }

    interface ArticleListItemAltum extends ArticleListItemBase {
        article: b2bShared.ArticleAltum;
    }

    interface CurrentSelectedGlobalFiltersValuesSummary {
        warehouseId: number;
        stockLevelFilter: StockLevelFilterType;
        onlyAvailable: boolean;
    }

    interface SortingOption {
        translatedName: string;
        value: ProductSortMode;
        isVisible: boolean;
    }

    interface ChangeSortModeData {
        sortMode: ProductSortMode;
        accuracyOptionVisibility: ProductSortingAccuracyVisibility;
    }

    interface CurrentSelectedFiltersValuesSummary {
        articleGroupFilters: FiltersRequestObject[];
        globalFilters: CurrentSelectedGlobalFiltersValuesSummary;
        sortMode: ProductSortMode;
    }

    interface articleUnitList {
        articleId: number,
        units: b2bShared.ArticleUnitPreview[];
    }

}
