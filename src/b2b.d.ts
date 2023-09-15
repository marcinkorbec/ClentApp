import { AttributeType } from './app/model/enums/attribute-type.enum';
import { CreditLimitBehaviourEnum } from './app/model/shared/enums/credit-limit-behaviour.enum';
import { Route } from '@angular/router';
import { PriceMode } from './app/model/enums/price-mode.enum';
import { CsvLineErrorEnum } from './app/model/enums/csv-line-error-enum.enum';
import { CsvLineWarningEnum } from './app/model/enums/csv-line-warning-enum.enum';
import { CsvParserResponseEnum } from './app/model/enums/csv-parser-response-enum.enum';
import { CsvProductFinalEnum } from './app/model/enums/csv-product-final-enum.enum';
import { PromotionType } from './app/model/enums/promotion-type.enum';
import { SafeHtml } from '@angular/platform-browser';
import { CyclicityType } from './app/model/enums/cyclicity-type.enum';
import { ProductStatus } from './app/model/enums/product-status.enum';
import { ProductStatus as ProductStringStatus } from './app/model/product/enums/product-status.enum';
import { b2bCart } from './integration/b2b-cart';
import { StockLevelMode } from './app/model/enums/stock-level-mode.enum';
import { b2bProductDetails } from './integration/b2b-product-details';
import { MaxQuantityDisplayType } from './app/model/shared/enums/max-quantity-type.enum';
import { StockLevelBehavoiurEnum } from './app/model/cart/enums/stock-level-behavoiur.enum';
import { b2bShared } from './integration/b2b-shared';
import { ImageType } from './app/model/shared/enums/image-type.enum';
import { b2bShippingAddress } from './integration/shared/b2b-shipping-address';
import { SourceDocumentNumberType } from './app/model/shared/enums/source-document-number-type.enum';
import { ProductDetailsType } from 'src/app/model/product/enums/product-details-type.enum';
import { AddToCartContext } from 'src/app/model/cart/enums/add-to-cart-context.enum';

export module b2b {

    /**
    * Object acting like a dictionary/map/associative array.
    */
    interface Collection<T> {
        [Key: string]: T;
    }

    interface GenericCollection<K, T> {
        [Key: K]: T;
    }

    interface CommonImage {
        imageId: number;
        imageType?: ImageType;
        imageUrl?: string;
        image: b2bShared.ImageBase;
        imageHeight: number;
        imageWidth: number;
    }

    /**
    * Customer header data received from server.
    * Object containes credit and currency infos.
    */
    interface CustomerHeaderResponse {

        outputs: {
            returN_VALUE: number
        };

        set1: HeaderCustomerInfo[];
    }

    /**
    * Credit and currency info.
    */
    interface HeaderCustomerInfo {
        assignedCustomerLimit: string;
        customerLimit: string;
        customer: string;
        contact: string;
        overDuePayments: number;
        existsUnlimitedCreditLimit: boolean;
    }

    /**
    * Single menu option in main menu.
    */
    interface MenuItem {
        cssClass: string;
        cssClassAlt?: string;
        resourceKey: string;
        params?: any;
        position: number;
        key?: RouteKey;

        /**
        * url path navigated via router (property [routerLink])
        */
        url?: string;

        /**
        * url path navigated via pure html (property [href])
        */
        href?: string;

        action?: string;
        withDataFilter?: boolean;
    }


    interface Breadcrumb {
        id: number;
        name?: string;
    }

    /**
    * Category group object.
    */
    interface Group extends Breadcrumb {

        /**
        * 1 when group has children.
        * 0 when it doesn't.
        */
        isExpand?: 0 | 1;

        /**
        * True if group is selected.
        * Parameter is created on the client's side, it doesn't come with response.
        */
        isActive?: boolean;
    }

    interface GroupsResponse {
        outputs: { returN_VALUE: number };

        /**
         * child groups
         * */
        set1: Group[];

        /**
         * group path (breadcrumbs)
         * */
        set2: Breadcrumb[];
    }

    /**
    * Groups/categories and history infos.
    */
    interface GroupsData {

        currentGorupId: number;
        childGroups: Group[];
        history: Group[];

    }

    /**
    * Basic select's option object
    */
    interface Option {
        id?: number;
        text?: string;
    }

    /**
    * Basic select's option object
    */
    interface Option2 {
        id?: number;
        name: string;
    }

    /**
    * Basic select's option object
    */
    interface Option3 {
        id: number;
        resourceKey: string;
    }

    interface Option4 {
        id: number;
        value: string;
    }

    interface NameValue {
        name: string;
        value: string;
    }

    /**
    * Warehouse option object
    */
    interface Warehouse {
        id: number;
        text: string;
    }

    /**
    * Pagination params.
    * Object is used on every paged list
    */
    interface PaginationConfig {

        currentPage?: number;
        totalPages?: number;
        buildPager?: boolean;

    }

    interface OldPaginationConfig {
        currentPage?: number;
        pageSize?: number;
        hasMore?: boolean;
    }


    interface PaginationRequestParams {
        pageNumber?: number;
    }

    interface OldPaginationRequestParams {

        skip?: number;
        top?: number;
    }

    interface PaginationResponse {
        buildPager: boolean;
        currentPage: number;
        totalPages: number;
    }

    /**
    * Array of units received in response
    */
    interface UnitResponse {
        id: number;
        no: number;
        unit: string;

        /**
         * Altum only
         * */
        isLocked?: boolean | null;

        /**
         * Altum only
         * */
        isDefault?: 0 | 1;
    }

    interface Prices {
        prices: AsyncConvertedPrices;
        index: number;
        thresholdPriceLists?: b2bProductDetails.ThresholdPriceLists;
    }

    interface PromiseData<T> {
        promise: Promise<T>;
        promiseResolve: Function;
        promiseReject: Function;
    }

    interface AsyncPricesBase {
        /**
         * null for basic unit
         * */
        auxiliaryUnit?: string;
        currency: string;
        stockLevel: string;
        type: number;
        itemExistsInCurrentPriceList: boolean;
        denominator: number;
        numerator: number;
        defaultUnitNo: number;
        isUnitTotal: 0 | 1;
        basicUnit: string;
        basePriceNo: number;

        /*
         * XL only
         */
        purchasePrice?: number;

        /*
         * Altum only
         */
        precision?: number;

    }

    interface ProductPropertiesDifferencesToConvert {
        grossPrice: string;
        netPrice: string;
        baseGrossPrice: string;
        baseNetPrice: string;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitGrossPrice?: string;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitNetPrice?: string;


        /**
         * XL only
         * For Altum: unitChangeBlocked?: boolean;
         * */
        unitLockChange?: 0 | 3;

        /**
         * Altum only.
         * For XL: unitLockChange?: 0 | 3;
         * */
        unitChangeBlocked?: boolean;
    }


    interface ProductPropertiesDifferencesConverted {
        grossPrice: number;
        netPrice: number;
        baseGrossPrice: number;
        baseNetPrice: number;
        unitLockChange: boolean;


        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitGrossPrice?: number;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitNetPrice?: number;
    }


    interface AsyncConvertedPrices extends AsyncPricesBase, ProductPropertiesDifferencesConverted {

    }

    /**
    * Base object for all products
    * It's base for product list's item, cart's list item and customer list's products.
    */
    interface BaseProduct extends CommonImage {
        code: string;
        auxiliaryUnit?: string;
        id: number;
        name: string;
        quantity?: number;
        max?: number;
    }


    /**
    * Base object for products to buy.
    * It's base for product list's item and cart's list item.
    */
    interface ProductToBuy extends BaseProduct {

        basicUnit: string;

        //found in source code; don't come with response
        converter?: any;
        unitPrecision?: any;
        cartId?: number;
        fromBinary?: any;
        state?: any;

    }

    /**
    * Request params for unit conversion
    */
    interface UnitConvertRequest {
        /**
        * Product id.
        */
        id: number;

        unitNo: number;
        features: string;
        warehouseId: number;
    }

    interface UnitDataBase {
        basicUnit: string;
        auxiliaryUnit?: string;
        isUnitTotal: 0 | 1;
        type: number;
        denominator: number;
        numerator: number;
        stockLevel: string;
        unitPrecision: number;
        currency: string;
        volume: number;
        bruttoWeight: number;
        nettoWeight: number;

        /**
         * [Notice!] the key begins with a capital letter
         * */
        volumeSymbolResourceKey?: string;

        /**
         * [Notice!] the key begins with a capital letter
         * */
        weightSymbolResourceKey?: string;
    }


    /**
    * Response received after unit conversion
    */
    interface UnitDataResponse extends UnitDataBase {
        netPrice: string;
        grossPrice: string;
        baseGrossPrice: string;
        baseNetPrice: string;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitGrossPrice?: string;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitNetPrice?: string;
    }

    /**
    * Response received after unit conversion
    */
    interface UnitData extends UnitDataBase {
        netPrice: number;
        grossPrice: number;
        baseGrossPrice: number;
        baseNetPrice: number;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitGrossPrice?: number;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitNetPrice?: number;
    }


    interface EmptyUnitMapElement {
        auxiliaryUnit?: string;
        basicUnit?: string;
        unit?: string;
    }

    interface FilledUnitMapElement {
        basicUnit: string;
        auxiliaryUnit: string;
        isUnitTotal: 0 | 1;
        netPrice: number;
        grossPrice: number;
        type: number;
        denominator: number;
        numerator: number;
        stockLevel: string;
        stockLevelNumber: number;
        unitPrecision: number;
        currency: string;
        converter: string;
        max: number;
        stockLevelNumber: number;
        volume: number;
        bruttoWeight: number;
        nettoWeight: number;
        baseNetPrice: number;
        baseGrossPrice: number;
        unitNetPrice: number;
        unitGrossPrice: number;
        showUnitNetPrice: boolean;
        showUnitGrossPrice: boolean;

        /**
         * [Notice!] the key begins with a capital letter
         * */
        volumeSymbolResourceKey: string;

        /**
         * [Notice!] the key begins with a capital letter
         * */
        weightSymbolResourceKey: string;

        unitLockChange: boolean;
        unitId: number;
        defaultUnitNo: number;
        areUnitDataFilled: boolean;
    }

    interface UnitMapElement extends EmptyUnitMapElement, Partial<FilledUnitMapElement> {

    }

    interface ProductListElement extends Partial<UnitMapElement>, Partial<AsyncConvertedPrices>, CommonImage {
        basePriceNo: number;
        precision: number;

        unitId?: number;
        units?: Map<number, UnitMapElement>;
        min?: number;

        unitChange?: any;
        quantityChanged?: boolean;
        noLink?: boolean;

        /**
         * False if some unit data are loading, eg. unit prices.
         */
        unitsLoaded?: boolean;

        /**
        * True when prices are loaded or showing prices is forbidden
        */
        pricesLoaded?: boolean;

        basicUnitNo: number;
        unitNetPrice?: number;
        unitGrossPrice?: number;
        thresholdPriceLists?: b2bProductDetails.ThresholdPriceLists;

        discountAllowed: boolean;
        rowNumber: number;
        code: string;
        id: number;
        name: string;
        quantity?: number;
        cartId?: number;

        /**
        XL only
         * */
        flag: number;

        /**
         * XL only
         * */
        availability?: number;

        /**
         * XL only
         * */
        status?: ProductStringStatus;

        /**
         * XL only
         * */
        availableFrom?: string;

        /**
        * Altum only
        * */
        fromBinary?: any;

        articleDetailsType: ProductDetailsType;

        extensions: b2bShared.ApiObjectExtension;
        objectExtension: b2bShared.ApiObjectExtensionOld;
    }

    /**
    * Cart's preview.
    * Includes basic summary of all carts.
    */
    interface CartsPreview {
        carts: Map<number, { count: number, currencies: CartPreviewItemResponse[] }>;
        summariesByCurrency: Map<string, { totalNetAmount: number, totalGrossAmount: number }>;
        cartsAmount: number;
        totalProductsAmount: number;
    }

    /**
    * Response after getting carts preview from server.
    */
    interface CartPreviewItemResponse {
        count: number;
        currency: string;
        grossAmount: number;
        id: number;
        netAmount: number;
        vatValue?: number;
        cartName?: string;
        fromQuote?: number;
        quoteNumber?: string;
    }


    interface CartItemDescription {
        description?: string;
        collapsedDescription?: string;
        isDescriptionOverflow: boolean;
        isDescriptionEdited: boolean;
        newDescription?: string;
    }
    /**
    * Product in cart
    */
    interface CartProductBase extends ProductToBuy, CartItemDescription {

        defaultUnitNo: number;
        isUnitTotal: 0 | 1;
        denominator?: number;
        numerator?: number;
        discount: string;
        fromQuote: number;
        itemId: number;
        no: number;
        totalValue: string;
        subtotalValue: string;
        vatDirection: 'N' | 'B';
        unit: string;
        stockLevel: string;
        type: number;

        //[NOTICE!!] The property specifies exceeded states PER ENTIRE CART.
        exceededStates: boolean;

        articleExceededStates: boolean;
        stockLevelBehaviour: StockLevelBehavoiurEnum;

        index: number;

        setDocumentsType?: number;

        //????
        bundleId: number;
        bundleCode: string;
        bundleQuantity: number;

        discountAllowed: boolean;
        currency: string;
        maxQuantityType: MaxQuantityDisplayType;
        isQuantityChangeBlocked: boolean;

        extensions: b2bShared.ApiObjectExtension;
        objectExtension: b2bShared.ApiObjectExtensionOld;
    }

    /**
    * Product in cart
    */
    interface CartProduct extends CartProductBase {

        totalPrice: number;
        subtotalPrice: number;
        quantityChanged: boolean;
        disabled: boolean;
        dontControl: boolean;
        basicUnitTotalPrice: number;
        basicUnitSubtotalPrice: number;
        forbidden: boolean;
        bundleId: number;
        alertedItems: number;
        warn: boolean;
        stockLevelNumber: number;
        status?: CartProductStatus;
        loading?: boolean;
        attributes?: b2bShared.PositionAttribute[];
    }

    interface CartProductStatus {
        outdated: boolean;
        warning: boolean;
        danger: boolean;
        info: boolean;
    }

    /**
    * Selected options info and few settings.
    */
    interface CartHeader {
        address?: string;
        addressId?: number;
        completionEntirely?: 0 | 1;

        /**
         * XL - name
         * Altum - id as string
         * */
        deliveryMethod?: string;

        description?: string;
        descriptionSI?: string;
        dueDate?: Date;
        headerId?: number;
        isConfirm?: 0 | 1;
        isDeliveryCost?: boolean;
        paymentForm?: string;
        paymentFormId?: number;
        receiptDate?: Date;
        showFeatures?: 0 | 1;
        sourceNumber?: string;
        sourceNumberSI?: string;
        stockLevelMode?: StockLevelMode;
        translationDeliveryMethod?: string;
        vatDirection?: 'N' | 'B';
        warehouseId?: number;
        warehouseName?: string;
        fromQuote?: number;
        quoteNumber?: string;
        shippingAddress?: b2bShippingAddress.ShippingAddressXl;
    }

    /**
    * Summary of all cart products.
    * All pages included in calculations.
    */
    interface CartSummary {
        count: number;
        currency: string;
        grossAmount: string;
        netAmount: string;
        vatValue: string;
        id: number;
        fromQuote?: number;
    }

    /**
    * Weight and volume of all of products.
    * All pages iIncluded in calculations.
    */
    interface CartWeight { //??
        weightGross: number;
        volume: number;

        /**
         * Delivery cost (may not exist)
         */
        costValue?: string;
        gidService?: number;
    }

    interface CartHeaderAttributeRequest {
        attributeClassId: number;
        type: AttributeType;
        itemId: 0;
        value?: any;
        headerId?: number;
        documentId?: number;
        applicationId?: number;
    }

    interface CartHeaderAttributeBase extends CartHeaderAttributeRequest {
        format?: string;
        name?: string;
        traslateName?: string;
    }


    interface CartHeaderAttribute extends CartHeaderAttributeBase {
        required?: boolean;
    }

    /**
    * Order IDs (system id and user id)
    */
    interface IDs {
        id: number;
        number: string;
    }

    /**
    * Response after creating new order
    */
    interface AddOrderResponse {

        outputs: {
            returN_VALUE: number;
        };

        error?: any;
        message?: any;
        /**
        * One-element array with order IDs.
        * Id can be used for redirect to added order.
        */
        set1?: IDs[];
        set2: any[];
        set3: any[];
        set4: any[];
    }

    interface AddDocumentSuccess {
        result: 0;
        ids: IDs;
    }

    /**
    * Parameters for loading product request
    */
    interface ProductRequestParams {
        warehouseId?: number;
        contextGroupId: number;
    }

    interface GetTreeParams {
        parentId?: number;
    }

    interface TreeParameters {
        groupId: number;
        parentId?: number;
    }

    interface ProductReplacementIDs {
        id: number;
        substituteId: number;
    }

    interface ProductReplacement extends ProductReplacementIDs, Partial<ProductReplacementFilled> {

    }

    interface ProductAttributesResponse {
        items: ProductAttributesItemsResponse;
        attachments: b2bShared.Attachment[];
    }

    interface ProductAttributesItemsResponse {
        outputs: { returN_VALUE: number };
        set1: ProductAttribute[];
        set2: Attachement[];
        set3: ProductImage[];
    }

    /**
    * Original response object received after loading product request.
    */
    interface ProductResponse {

        productDetails: ProductDetailsInfoResponse;
        substitutes: ProductReplacementIDs[];
    }

    /**
   * Corrcted response object received after loading product request.
   * Prices as number.
   */
    interface ProductResponseConverted {

        productDetails: ProductDetailsInfo;
        substitutes: ProductReplacementIDs[];
    }

    interface ProductDetailsInfoBase {
        articleUrl: string;
        articleGroupId: number;
        basicUnit: string;
        brand: string;
        code: string;
        currency: string;
        defaultUnitNo: number;
        description: string;
        isUnitTotal: 0 | 1;
        manager: string;
        managerMail: string;
        manufacturer: string;
        manufacturerUrl: string;
        name: string;
        stockLevel: string;
        type: number;
        bruttoWeight: number;
        nettoWeight: number;
        volume: number;
        discountAllowed?: boolean;

        /**
         * [Notice!] the key begins with a capital letter
         * */
        volumeSymbolResourceKey: string;

        /**
         * [Notice!] the key begins with a capital letter
         * */
        weightSymbolResourceKey: string;

        /**
         * Product promotional flags as bitwise flag
         * */
        flag: number;

        vatRate: number;
        vatValue: number;
        wmc: number;

        featuresParam?: string;
        id: number;

        auxiliaryUnit?: string;
        denominator?: any;
        numerator?: any;
        unitPrecision?: any;

        fromBinary: any;
        state: string;
        quantityPrecision?: any;

        /**
         * XL only
         * */
        availability?: number;

        /**
         * XL only
         * */
        status?: number;

        /**
         * XL only
         * */
        availableFrom?: string;
        basicUnitNo: number;
    }



    /**
    * Details of product.
    * Description, manager, manufacturer, etc.
    */
    interface ProductDetailsInfoResponse extends ProductDetailsInfoBase {
        netPrice: string;
        grossPrice: string;
        baseNetPrice: string;
        baseGrossPrice: string;

        /**
         * XL only
         * For Altum: unitChangeBlocked?: boolean;
         * */
        unitLockChange?: 0 | 3;

        /**
         * Altum only.
         * For XL: unitLockChange?: 0 | 3;
         * */
        unitChangeBlocked?: boolean;


        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitGrossPrice?: string;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitNetPrice?: string;


    }

    /**
    * Details of product.
    * Description, manager, manufacturer, etc.
    */
    interface ProductDetailsInfo extends ProductDetailsInfoBase {
        netPrice: number;
        grossPrice: number;
        baseNetPrice: number;
        baseGrossPrice: number;
        stockLevelNumber: number;
        cartId: number;
        quantity: number;
        unitId: number;
        converter: string;
        unitsLoaded: boolean;
        unitLockChange: boolean;


        /**
        * Received when the basic unit is an auxiliary unit
        * */
        unitGrossPrice: number;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitNetPrice: number;

        units: b2b.GenericCollection<number, string>;
        unitsLength: number;
        showLastOrder: boolean;
        showPlannedDeliveries: boolean;
        showArticleThresholdPrices: boolean;
        storeId: number;
    }

    /**
    * Product attribute
    */
    interface ProductAttribute {
        type: number;
        name: string;
        value: string;
    }

    interface ProductReplacementBase extends CommonImage {
        basicUnit: string;
        code: string;
        currency: string;
        defaultUnitNo: number;
        forHowMuch: number;
        howMuch: string;
        id: number;
        isUnitTotal: 0 | 1;
        name: string;
        stockLevel: string;
        type: number;
        discountAllowed?: boolean;
        quantityPrecision: any;
        fromBinary: any;
        unitPrecision?: any;
        auxiliaryUnit?: string;
        basicUnitNo: number;
    }

    /**
    * Product replacement
    */
    interface ProductReplacementResponse extends ProductReplacementBase {
        netPrice: string;
        grossPrice: string;
        baseNetPrice: string;
        baseGrossPrice: string;

        /**
         * XL only
         * For Altum: unitChangeBlocked?: boolean;
         * */
        unitLockChange?: 0 | 3;

        /**
         * Altum only.
         * For XL: unitLockChange?: 0 | 3;
         * */
        unitChangeBlocked?: boolean;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitGrossPrice?: string;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitNetPrice?: string;

    }

    /**
    * Product replacement
    */
    interface ProductReplacementFilled extends ProductReplacementBase {
        netPrice: number;
        grossPrice: number;
        baseNetPrice: number;
        baseGrossPrice: number;
        quantity: number;
        stockLevelNumber: number;
        unitId: number;
        units: Map<number, UnitMapElement>;
        cartId: number;
        converter: string;
        unitsLoaded: boolean;
        //basicUnitNetPrice: number;
        //basicUnitGrossPrice: number;
        unitLockChange: boolean;

        /**
         * XL only
         * */
        availability?: number;

        /**
         * XL only
         * */
        status?: ProductStatus;

        /**
         * XL only
         * */
        availableFrom?: string;


        /**
        * Received when the basic unit is an auxiliary unit
        * */
        unitGrossPrice: number;

        /**
         * Received when the basic unit is an auxiliary unit
         * */
        unitNetPrice: number;

        denominator: number;
        numerator: number;
    }

    /**
    * File attachment object on product details.
    */
    interface Attachement {
        id: number;
        name: string;
        extension: string;
        size: number;
    }


    interface ControlFiltersParams {
        getFilter?: boolean;
        updateFilter?: boolean;
        controlDate?: boolean;
    }

    interface CustomerDetails {
        address: string;
        city: string;
        creditUsed: number;
        currency: string;
        deliveryMethod: string;
        dueDate: number;
        ein: string;
        email: string;
        fax: string;
        limitAfterDueDate: number;
        maxLimitValuable: number;
        name1: string;
        name2: string;
        name3: string;
        nin: string;
        overduePayments: number;
        paymentForm: string;
        shippingCity: string;
        shippingStreet: string;
        shippingZipCode: string;
        street: string;
        supervisor: string;
        supervisorEmail: string;
        supervisorTelephone: string;
        telephoneNo1: string;
        telephoneNo2: string;
        tin: string;
        www: string;
        zipCode: string;
    }

    interface Employee {
        contactId: number;
        email: string;
        gg: string;
        name: string;
        position: string;
        skype: string;
        skypeUrl: SafeUrl;
        telephoneNo1: string;
        telephoneNo2: string;
    }

    interface CustomerDataResponse {
        outputs: {
            returN_VALUE: number;
        };

        set1: CustomerDetails[];

    }

    interface EmployeesResponse {

        outputs: {
            returN_VALUE: number;
        };

        /**
        * Array of employees
        */
        set1: Employee[];
    }




    interface CustomerListDetails {
        issueDate: string;
        number: string;
        sourceNumber: string;
        showDetails: boolean;
    }

    interface CustomerListDetailsSummary {
        count: number;
        net: number;
        gross: number;
        currency: string;
    }


    interface CustomerListDetailsResponse {
        outputs: { returN_VALUE: number };
    }


    interface AddProductToWarehouse {
        isPromotionForWarehouse: boolean;
        warehouseId: number;
    }


    interface ComplaintFormProduct extends CommonImage {
        auxiliaryUnit: string;
        basicQuantity: number;
        basicUnit: string;
        code: string;
        currency: string;
        defaultUnitNo: number;
        discount: number;
        isAvailable: number;
        isUnitTotal: number;
        itemId: number;
        name: number;
        price: number;
        quantity: number;
        sourceDocumentId: number;
        sourceDocumentName: string;
        sourceDocumentNo: number;
        sourceDocumentType: number;
        subtotalValue: number;
        totalValue: number;
        unitConversion: string;
        vatDirection: 'N' | 'B';
        max?: number;
        value?: number;
        attributes?: b2bShared.PositionAttribute[];
    }

    interface ComplaintFormConfig {
        itemsCount: number;
    }

    interface ComplaintFormDetails {

        outputs: { returN_VALUE: number };
        set1: ComplaintFormProduct[];
        set2: ComplaintFormConfig[];

    }

    interface ComplainData {
        Description: string;
        SourceNumber: string;
        products: {
            ArticleId: number;
            Quantity: number;
            Reason: string;
            Request: number;
            SourceDocumentId: number;
            SourceDocumentNo: number;
            SourceDocumentTypeId: number;
        }[];
    }

    interface ComplaintResponse {
        outputs: { returN_VALUE: number };
        set1: IDs[];
    }

    interface PremissionsResponseBase {
        hasAccessToCreateInquiries: boolean;
        hasAccessToEditQuantityInQuotes: boolean;
        hasAccessToCreateComplaints: boolean;
        hasAccessToPrinting: boolean;
        hasAccessToConfirmOrder: boolean;
        hasAccessToChangeDeliveryMethod: boolean;
        hasAccessToChangePaymentMethod: boolean;
        hasAccessToPriceList: boolean;
        hasAccessToDeleteUnconfirmedOrder: boolean;
        hasAccessToComplaintsList: boolean;
        hasAccessToMarkOrderToEntirelyRealization: boolean;
        hasAccessToCustomerData: boolean;
        hasAccessToShowDeliveryMethod: boolean;
        hasAccessToPackagesList: boolean;
        hasAccessToInquiriesList: boolean;
        hasAccessToOrdersList: boolean;
        hasAccessToPaymentsList: boolean;
        hasAccessToQuotesList: boolean;
        hasAccessToReservationList: boolean;
        hasAccessToTargetPartner: boolean;
        hasAccessToNews: boolean;
        hasAccessToPackagesList: boolean;
        hasAccessToEmployeesList: boolean;
        hasAccessToAttachmentsList: boolean;
        hasAccessToChangePaymentDateTime: boolean;
        hasAccessToCartImport: boolean;
        hasAccessToServiceJobs: boolean;
        hasAccessToPriceFromLastOrder: boolean;

        hasAccessToChangeCompletionEntirelyInQuotes: boolean;
        hasAccessToChangeDeliveryMethodInQuotes: boolean;
        hasAccessToChangePaymentDateInQuotes: boolean;
        hasAccessToChangePaymentFormInQuotes: boolean;
        hasAccessToChangeReceiptDateInQuotes: boolean;
        hasAccessToChangeWarehouseInQuotes: boolean;
        hasAccessToShowDeliveryMethodInQuotes: boolean;
        hasAccessToGenerateManyOrdersFromQuote: boolean;
        hasAccessToPlannedDeliveries: boolean;
        hasAccessToStore: boolean;
        hasAccessToAddPermShippingAddress: boolean;
        hasAccessToAddTempShippingAddress: boolean;
    }

    interface PermissionsResponseAfterUnification extends PremissionsResponseBase {
        hasAccessToArticleList: boolean;
        hasAccessToPromotionList: boolean;
        hasAccessToChangeRealizationTime: boolean;
        hasAccessToChangeOrderWarehouse: boolean;
        hasAccessToChangeDefaultWarehouse: boolean;
        hasAccessToCart: boolean;
        hasAccessToDiscount: boolean;
    }

    interface PermissionsResponseBeforeUnification extends PremissionsResponseBase {

        /**
         * XL only
         */
        hasAccessToPromotionList?: boolean;

        /**
         * XL only
         */
        hasAccessToChangeRealizationTime?: boolean;

        /**
         * XL only
         */
        hasAccessToChangeOrderWarehouse?: boolean;

        /**
         * XL only
         */
        hasAccessToChangeDefaultWarehouse?: boolean;


        /**
         * XL only
         */
        hasAccessToArticleList: boolean;


        /**
        * XL only
        */
        hasAccessToCart: boolean;

        /**
        * XL only
        */
        hasAccessToDiscount: boolean;


        /**
         * Altum only
         */
        hasAccessToPromotions?: boolean;

        /**
         * Altum only
         */
        hasAccessToChangeOrderRealizationDate?: boolean;


        /**
         * Altum only
         */
        hasAccessToWarehouseChange?: boolean;


        /**
         * Altum only
         */
        hasAccessToArticleCatalog?: boolean;


        /**
        * Altum only
        */
        hasAccessToCarts?: boolean;


        /**
        * Altum only
        */
        hasAccessToRebate?: boolean;

        /**
        * Altum only
        */
        hasAccessToEditQuantityInQuote?: boolean;
    }


    interface Permissions extends PermissionsResponseAfterUnification {
        hasAccessToProfile: boolean;
    }

    interface CustomerConfig {
        showCode: boolean;
        showState: boolean;
        stateMode: boolean;
        calculateDiscount: boolean;
        priceMode: PriceMode;
        showFeatures: boolean;
        showImages: boolean;
        stateAvailableColor: string;
        stateNoneColor: string;

        /**
         * Altum - number of decimal places
         * XL - 1 if 2 places, 0 if 4 places
         * */
        precision: number;

        pageSize: number;
        warehouseId: number;
        warehouseName: string;
        aboveAvailableStockLevel: number;
        stockLevelMode: number;
        companyUnitId: number;
        conditionWarehouseNumber: number;
        operatorContext: false;
        orderBlock: 0 | 1;
        promotionPar: number;
        stockFunctionXl: boolean;
        sysCurrency: string;
        tolerance: number;
        wfL_SupportProcesses: number;
        onlyEntirelyCompletion: boolean;

        /**
         * XL only
         * */
        withoutKgo: 0 | 1;

        /**
         * XL only
         * */
        priceCalculatedDiscount: boolean;

        /**
         * XL only
         * */
        companyUnitPath: any;

        /**
         * XL only
         * */
        numberOfAllowedSignsOnCartOwnNumber: number;
        customerCurrency: string;
        supervisor: string;
        supervisorEmail: string;
        supervisorImage: b2bShared.ImageBase;
        supervisorTelephone: string;

        addToWarehouseId: number;
        generateConfirmedOrders: boolean;
    }

    interface CustomerConfigResponse extends CustomerConfig {
        rights: PermissionsResponseBeforeUnification;
    }

    interface UnitConverter {
        denominator: number;
        numerator: number;
        basicUnit: string;
        auxiliaryUnit: string;
    }

    interface RemindData {
        customerName: string;
        userName: string;
        companyGroupId: number;
    }


    interface ResetPwdData {
        password: string;
        repeatPassword: string;
        hash: string;
    }

    interface LoginData extends RemindData {
        password: string;
        rememberMe: boolean;
        loginConfirmation: boolean;
    }

    interface Company {
        GroupId: number;
        Name: string;
        CompanyUnitId: number;
        SubCompanyUnitId: number;
    }

    interface Language {
        Id: number;
        Name: string;
        ErpId: string;
        LanguageCode: string;
        IsDefault: boolean;
    }


    type RouteKey = 'home'
        | 'items'
        | 'itemDetails'
        | 'cart'
        | 'promotions'
        | 'login'
        | 'remind'
        | 'remindPassword'
        | 'resetPassword'
        | 'fileImportResult'
        | 'profile'
        | 'thankYou'
        | 'orders'
        | 'myData'
        | 'quotes'
        | 'inquiries'
        | 'payments'
        | 'complaints'
        | 'delivery'
        | 'orderDetails'
        | 'paymentDetails'
        | 'quoteDetails'
        | 'inquiryDetails'
        | 'complaints'
        | 'complaintItems'
        | 'complaintForm'
        | 'complaintDetails'
        | 'deliveryDetails'
        | 'employees'
        | 'pending'
        | 'files'
        | 'news'
        | 'newsDetails'
        | 'serviceJobs'
        | 'serviceJobDetails'
        | 'store';


    interface RouteWithKey extends Route {
        key?: RouteKey;
        children?: RouteWithKey[];
    }

    interface LoginConfirmationData {
        IsLoginConfirmationRequired: boolean;
        LoginConfirmationResourceKey: string;
    }

    interface ImportFromCsvResponse {
        responseEnum: CsvParserResponseEnum;
        lineSummary: ImportFromCsvLineSummary[];
        atLeastOneProductImported: boolean;
        atLeastOneWarning: boolean;
        atLeastOneError: boolean;
        cartIdentifier?: b2bCart.CartIdentifier;
    }

    interface ImportFromCsvLineSummary {
        lineNumber: number;
        code: string;
        unit: string;
        lineWarnings: CsvLineWarningEnum[];
        lineError: CsvLineErrorEnum;
        productLineFinalStates: ImportFromCsvFinalLineStates[];
    }

    interface ImportFromCsvFinalLineStates {
        productId: number;
        finalState: CsvProductFinalEnum;
    }

    interface CopyOrderToCartRequest {
        documentId: number;
        cartId: number;
        pageId: number;
        createNewCart: boolean;
    }

    interface CopyPaymentToCartRequest extends CopyOrderToCartRequest {
        documentTypeId: number;
    }

    interface CopyQuoteToCartRequest extends CopyOrderToCartRequest {
        sourceNumber: string;
        stateId: number;
    }

    interface CopyToCartRequest extends CopyOrderToCartRequest, Partial<CopyPaymentToCartRequest>, Partial<CopyQuoteToCartRequest> {

    }

    interface NewsListItem {
        title: string;
        category: string;
        categories: string[];
        image: {
            id: number;
            height: number;
            width: number;
        };
        id: number;
        creationDate: string;
    }


    interface NewsDetailsResponseAttachment {
        id: number;
        hashOrUrl: string;
        isUrl: boolean;
        name: string;
        extension: string;
    }

    interface NewsDetailsAttachment extends NewsDetailsResponseAttachment {
        url: string;
    }

    interface NewsDetailsBase {
        attachments: b2bShared.Attachment[];
        title: string;
        category: string;
        image: {
            id: number;
            height: number;
            width: number;
        };
        id: number;
        creationDate: string;
    }

    interface NewsDetailsResponse extends NewsDetailsBase {
        content: string;
    }

    interface NewsDetails extends NewsDetailsBase {
        content: SafeHtml;
    }


    /**
    * Adding to cart request params.
    */
    interface AddToCartRequest {
        cartId: number;
        warehouseId: number;
        createNewCart: boolean;
        items: AddToCartRequestItem[];
        additionalContext?: AddToCartContext;
    }

    interface AddToCartRequestItem {
        articleId: number;
        quantity: number;
        unitDefault: number;
    }

    interface ProductImage {
        id: number;
        default: 0 | 1;
        imageType: ImageType;
        url: string;
        imageSrc?: string;
    }
    //PG zmiana - start
    interface CategoriesHomePage {
        id: number;
        header: string;
        imageSrc?: string;
        imageAlt?: string;
        buttonURL: string;
    }

    interface CategoriesHomePageIcon {
        id: number;
        imageSrc?: string;
        imageAlt?: string;
        buttonURL: string;
    }

    interface ProductNews {
        id: number;
        name: string;
        imageSrc?: string;
        imageAlt?: string;
        productURL: string;
    }

    interface News {
        id: number;
        date: string;
        title: string;
        description: string;
        types: string[];
        tags?: string[];
        imageSrc?: string;
        imageAlt?: string;
        url: string;
    }

    interface ComplaintReason{
        id:number;
        name:string;
    }

    interface RepairType{
        id:number;
        value: string;
        name:string;
    }

    //PG zmiana - koniec
}
