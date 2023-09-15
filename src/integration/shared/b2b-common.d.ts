import { b2bProductsFilters } from '../products/b2b-products-filters';

export module b2bCommon {

    /**
     * format: 2021-04-27T07:31:25.945Z
     */
    type DateISOString = string;

    interface GETParams {
        [param: string]: string | string[];
    }

    interface GetGlobalFiltersBaseResponse {
        globalFilters: b2bProductsFilters.GlobalFilter[];
    }

    interface GetGlobalFiltersXlResponse extends GetGlobalFiltersBaseResponse { }
    interface GetGlobalFiltersAltumResponse extends GetGlobalFiltersBaseResponse { }

    interface Option {
        id: number;
        name: string;
    }

    interface Option2 {
        id: number;
        value: string;
    }
}
