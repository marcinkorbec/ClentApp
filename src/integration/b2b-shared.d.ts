import { BoxMessageClass } from '../app/model/shared/enums/box-message-class.enum';
import { DisplayType } from '../app/model/enums/display-type.enum';
import { BoxMessageType } from '../app/model/shared/enums/box-message-type.enum';
import { PriceMode } from '../app/model/enums/price-mode.enum';
import { MaxQuantityDisplayType } from '../app/model/shared/enums/max-quantity-type.enum';
import { ImageType } from '../app/model/shared/enums/image-type.enum';
import { AttachmentType } from '../app/model/shared/enums/attachment-type.enum';
import { OptionBaseStatus } from 'src/app/model/shared/enums/option-base-status.enum';
import { AddToCartContext } from 'src/app/model/cart/enums/add-to-cart-context.enum';
import { b2b } from 'src/b2b';

export module b2bShared {

    interface GenericCollection<K, T> {
        [Key: K]: T;
    }

    interface RepresentsExistingValueBase {
        representsExistingValue: boolean;
    }

    interface RepresentsExistingValue<T> extends RepresentsExistingValueBase {
        value: T;
    }

    interface WeightAndVolume {
        weightGross: number;
        volume: number;
    }

    interface PaginationRequestParams {
        pageNumber: number;
    }

    interface PaginationResponse {
        buildPager: boolean;
        currentPage: number;
        totalPages: number;
    }

    interface AuxiliaryUnit extends RepresentsExistingValueBase {
        unit: string;
    }

    interface ArticleBase {
        id: number;
        image: ImageBase;
        name: string;
        type: number;
        code: RepresentsExistingValue<string>;
        discountPermission: boolean;
        extensions: b2bShared.ApiObjectExtension;
        objectExtension: b2bShared.ApiObjectExtensionOld;
    }

    interface ArticleXl extends ArticleBase { }
    interface ArticleAltum extends ArticleBase { }
    type ArticleBothIntersection = ArticleXl & ArticleAltum;

    interface ArticlePriceBase {
        currency: string;
        discount: string;
        subtotalPrice: string;
        totalPrice: string;
        subtotalValue: string;
        totalValue: string;
        subtotalUnitPrice: RepresentsExistingValue<string>;
        totalUnitPrice: RepresentsExistingValue<string>;
    }

    interface ArticlePriceXl extends ArticlePriceBase { }
    interface ArticlePriceAltum extends ArticlePriceBase { }


    interface ArticleUnits extends Partial<ArticleUnitsExtension> {
        auxiliaryUnit: AuxiliaryUnit;
        numerator: RepresentsExistingValue<number>;
        denominator: RepresentsExistingValue<number>;
        basicUnit: string;
        defaultUnitNo: number;
        isUnitTotal: boolean;
        unitLockChange?: boolean;
    }

    interface ArticleUnitsExtension {
        unitId: number;
        converter: string;
        currentUnit: string;
    }

    interface ArticleUnitPreview {
        unitId: number;
        unitName: string;
    }

    interface StockLevel extends RepresentsExistingValueBase {
        value: string;
    }

    interface ExceededStates extends RepresentsExistingValueBase {
        hasExceededStates: boolean;
    }

    interface Quantity {
        value: number;
        isQuantityChangeBlocked: boolean;
        maxQuantityType: MaxQuantityDisplayType;
    }

    interface AvailableCarts {
        cartsIds: number[];
    }

    interface BoxMessages {
        messages: BoxMessageType[];
        showBoxMessage: boolean;
        boxMessageClass: BoxMessageClass;
    }


    interface ProductListConfig {
        displayType?: DisplayType;
    }

    interface ProductDetailsCacheBaseElement {
        auxiliaryUnit: string;
        basicUnit: string;
        isUnitTotal: 0 | 1;
        netPrice: number;
        grossPrice: number;
        type: number;
        denominator: number;
        numerator: number;
        stockLevel: string;
        unitPrecision: number;
        currency: string;
        baseNetPrice: number;
        baseGrossPrice: number;
        unitNetPrice: number;
        unitGrossPrice: number;

        stockLevelNumber: number;
        converter: string;
    }

    interface SelectBaseOption {
        id?: number;
        name: string;
    }

    interface AutocompleteConfig {
        items?: any[];
        loading: boolean;
        isAutocompleteEnabled: boolean;
    }

    interface UpdateItemDescription {
        itemId: number;
        newDescription: string;
    }

    interface ProductTableConfig {
        priceMode?: PriceMode;
        haveProductsDescription?: boolean;
        canEditProductsDescription?: boolean;
        productDescriptionMaxLength?: number;
        hasRemoveButton?: boolean;
        onlyNameLinksToProductsDetails?: boolean;
        haveBottomButton?: boolean;
        addToCartContext?: AddToCartContext;
    }

    interface SelectOptionChangeModel {
        value: any;
        label: string;
        id: string;
        hasEditLink?: boolean;
    }

    interface Country {
        name: string;
        id: number;
        zipCodeRegex?: string;
    }

    interface GetCountriesXlResponse {
        countries: Country[];
        defaultCountry: Country;
    }

    interface CountriesSummary extends GetCountriesXlResponse { }

    interface Status {
        isVisible: boolean;
        autoHide?: boolean;
        autoHideTimeout?: number;
    }

    interface PriceBase {
        currency: string;
        netPrice: number;
        grossPrice: number;
        baseNetPrice: number;
        baseGrossPrice: number;
        unitNetPrice: RepresentsExistingValue<number>;
        unitGrossPrice: RepresentsExistingValue<number>;
    }

    interface PriceXl extends PriceBase {
        vatValue: number;
    }
    interface PriceAltum extends PriceBase { }

    interface ImageBase {
        imageType: ImageType;
        imageId: number;
        imageUrl: string;
    }

    interface CommonImage {
        imageId: number;
        imageType?: ImageType;
        imageUrl?: string;
        image: b2bShared.ImageBase;
        imageHeight: number;
        imageWidth: number;
    }

    interface Attachment {
        id: number;
        fullName: string;
        extension: string;
        type: AttachmentType;
        hash: string;
        url: string;
        creationDate?: string;
        modificationDate?: string;
    }

    interface AttachmentViewModel extends Attachment {
        href?: string;
        target?: string;
    }

    interface CustomerFile extends AttachmentViewModel {
        creationTime?: string;
        modificationTime?: string;
    }

    interface ApiExtensionElement {
        key: string;
        value: any;
    }

    interface ApiObjectExtensionOld {
        extendedItemsList: ApiExtensionElement[];
    }

    interface ApiObjectExtension {
        extendedItemsList: GenericCollection<string, any>;
    }

    interface SwitchControlModel {
        id: number;
        translatedHeader: string;
        values: OptionBase[];
    }

    interface OptionBase {
        id: number;
        translatedName: string;
        status: OptionBaseStatus;
    }

    interface PropertyValuePreviewModel {
        propertyId: number;
        valueId: number;
    }

    interface PositionAttribute {
        translatedName: string;
        values: string[];
    }

    interface Attrubute {
        type: AttributeType;
        name: string;
        value: string;
        objectExtension: ApiObjectExtensionOld;
        extensions: ApiObjectExtension;
    }

    interface TreeParentGroup {
        id: number;
        name: string;
    }

    interface TreeGroup {
        id: number;
        isExpand: 0 | 1;
        name: string;
    }

    interface TreeGroupModalData {
        id: number;
        history: b2b.Breadcrumb[];
    }

    interface GetTreeResponse {
        groups: TreeGroup[];
        parentGroups: TreeParentGroup[];
    }

    interface AddProductToWarehouse {
        isPromotionForWarehouse: boolean;
        warehouseId: number;
    }

    type VatDirection = 'N' | 'B';

}
