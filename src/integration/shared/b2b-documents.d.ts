import { b2b } from 'src/b2b';
import { b2bShared } from '../b2b-shared';
import { CreditLimitBehaviourEnum } from '../shared/enums/credit-limit-behaviour.enum';

export module b2bDocuments {

    export interface DocumentReference {
        id: number;
        number: string;
    }

    export interface PaymentReference extends DocumentReference {
        type: SourceDocumentNumberType;
    }

    export interface SharedRequestParams {
        dateFrom: b2bCommon.DateISOString;
        dateTo: b2bCommon.DateISOString;
        getFilter: boolean;
        updateFilter: boolean;
        controlDate: boolean;
        pageNumber: number;
    }

    export interface SharedDocumentRequestParams extends SharedRequestParams {
        stateId: number;
    }

    export interface SharedFilteringOptions {
        dateFrom: Date;
        dateTo: Date;
    }

    export interface SharedDocumentFilteringOptions extends SharedFilteringOptions {
        stateId: number;
    }

    export interface SharedDocumentRequestParams extends SharedDocumentRequestParams {
        stateId: number;
    }

    export interface StateResource {
        id: number;
        resourceKey: string;
    }

    export interface ListItemBase {
        extensions: b2bShared.ApiObjectExtension;
    }

    export interface NewListResponse<ListItem extends ListItemBase, ListPropertyName extends string> {
        [ListPropertyName]: ListItem[];
        paging: PaginationConfig;
    }

    /**
     * Columns config for dynamically generated data tables
     * */
    interface ColumnConfig {

        /*
         * Property name of displayed value
         */
        property?: string;

        /**
         * Translation key; if it is different than property name
         * */
        translation?: string;

        /**
         * Type of column; if it is rendered in a special way.
         * Eg. price is rendered with toPrice pipe; quantity is rendered with unit and unit converter.
         * */
        type?: 'productName'
        | 'productNameWithoutPhoto'
        | 'remove'
        | 'price'
        | 'priceWithConverter'
        | 'priceWithCurrency'
        | 'quantity'
        | 'quantityWithStepper'
        | 'unit'
        | 'addToCart'
        | 'linkedDocumentsArray'
        | 'linkedDocument'
        | 'complain'
        | 'daysAfterDueDate'
        | 'html'
        | 'cases'
        | 'complaintHistory' // refactoring
        | 'promotionValue'
        | 'percent'
        | 'fileName'
        | 'translation'
        | 'dateWithTime'
        | 'valueWithUnit'
        | 'quoteRealizationWithEmptyContent'
        | 'noValueSymbol';

        /**
         * Link structure for linked documents. Required for 'linkedDocument' and 'linkedDocumentsArray' types.
         * */
        link?: {
            type?: 'routerLink' | 'href'; //routerLink default
            hrefCreator?: Function;
            targetCreator?: Function;
            labelProperty?: string;
            labelResource?: string;
            labelIcon?: string;
        };

        /**
         * Property name of basic price. Required for 'priceWithConverter' type.
         * */
        priceConverter?: string;

        /**
         * Required if property name in table summary differs from the property name in table body.
         * */
        summaryProperty?: string;

        /**
         * Required for case type
         * */
        cases?: { case: any; translation: string }[];

        /**
         * Applies filter to column. Works only for documents list.
         */
        filter?: {
            property: string;

            type: 'text' | 'select' | 'date';

            /**
            * Method which request filter values.
            * */
            valuesLoader?: Function;

            /**
             * Property name of filter values. Required for select type.
             * */
            valuesProperty?: string;


            defaultValue?: any;
        };

        /**
         * Property of file extension. Required for fileName type.
         * */
        fileExtensionProperty?: string;

        /**
         * Sets class when value equals qiven value
         * */
        classCondition?: {
            valueEquals: any;
            class: string;
        };

        /**
         * Unit property for valueWithUnit type
         * */
        unitProperty?: string;

        /**
         * True if visible on mobile
         */
        mobileVisibleColumn?: boolean;
        mobileHiddenHeader?: boolean;
    }

    interface EmptyListInfo {
        resx: string;
        svgId: string;
    }
    
    interface SharedDetailsHeaderBase {
        number: string;
        sourceNumber: string;
        stateResourceKey: string;
        extensions: b2bShared.ApiObjectExtension;
    }

    interface SharedDetailsHeader extends SharedDetailsHeaderBase {
        state: number;
    }

    interface DocumentDetailsItemBase {
        extensions: b2bShared.ApiObjectExtension;
    }

    interface DocumentProductItem extends DocumentDetailsItemBase {
        image: b2bShared.ImageBase;
        position: number;
        name: string;
        code: string;
        price: number;
        value: number;
        netValue: number;
        grossValue: number;
        precision: number;
        currency: string;
        quantity: number;
        discount: number;
        auxiliaryUnit: string;
        unitConversion: string;
        attributes: b2bShared.PositionAttribute[];
    }

    interface DetailsSummary {
        count: number;
        net: number;
        gross: number;
        currency: string;
        extensions: b2bShared.ApiObjectExtension;
    }

    interface DetailsResponseBase<header extends SharedDetailsHeaderBase, item extends DocumentProductItem> {
        [string]: header;
        [string]: item[];
        [string]: b2bShared.Attachment[];
        attributes: b2bShared.Attrubute[];
    }

    export interface ConfirmDocumentResponse {
        isConfirmed: boolean;
        exceededCreditLimit: boolean;
    }

    export interface PropertyNames {
        headerProperty?: string;
        itemsProperty?: string;
        summaryProperty?: string;
        attachmentsProperty?: string;
    }

    
    /**
    * system id and user id
    */
    export interface DocumentIDs {
        id: number;
        number: string;
    }
}