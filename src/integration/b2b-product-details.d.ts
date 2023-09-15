import { b2bShared } from './b2b-shared';
import { VatDirectionEnum } from 'src/app/model/shared/enums/vat-direction.enum';
import { ProductStatus } from 'src/app/model/product/enums/product-status.enum';
import { ProductAvailabilityStatus } from 'src/app/model/product/enums/product-availability-status.enum';
import { ProductDetailsType } from 'src/app/model/product/enums/product-details-type.enum';
import { ProductVariantsModalStatus } from 'src/app/model/product/enums/product-variants-modal-status.enum';
import { OptionBaseStatus } from 'src/app/model/shared/enums/option-base-status.enum';

export module b2bProductDetails {

    //------requests

    interface GetLastOrderRequest {
        articleId: number;
    }

    interface GetPlannedDeliveriesRequest {
        articleId: number;
    }

    interface GetThresholdPriceListBaseRequest {
        articleId: number;
    }

    interface GetThresholdPriceListXlRequest extends GetThresholdPriceListBaseRequest {
        warehouseId: number;
        vatValue: number;
        currency: string;
    }

    interface GetThresholdPriceListAltumRequest extends GetThresholdPriceListBaseRequest { }
    type GetThresholdPriceListRequestBoth = GetThresholdPriceListXlRequest | GetThresholdPriceListAltumRequest;

    interface ConvertUnitsBaseRequest {
        id: number;
        unitId: number;
        warehouseId: number;
    }

    interface GetArticlePurchaseDetailsBaseRequest {
        articleId: number;
        warehouseId: number;
    }
    interface GetArticlePurchaseDetailsXlRequest extends GetArticlePurchaseDetailsBaseRequest { }
    interface GetArticlePurchaseDetailsAltumRequest extends GetArticlePurchaseDetailsBaseRequest { }

    interface GetAttributesBaseRequest {
        articleId: number;
    }
    interface GetAttributesXlRequest extends GetAttributesBaseRequest { }
    interface GetAttributesAltumRequest extends GetAttributesBaseRequest { }

    interface GetArticleGeneralInfoBaseRequest {
        articleId: number;
        contextGroupId: number;
    }
    interface GetArticleGeneralInfoXlRequest extends GetArticleGeneralInfoBaseRequest { }
    interface GetArticleGeneralInfoAltumRequest extends GetArticleGeneralInfoBaseRequest { }

    interface GetArticleDetailsBaseRequest {
        articleId: number;
        contextGroupId: number;
    }
    interface GetArticleDetailsXlRequest extends GetArticleDetailsBaseRequest { }
    interface GetArticleDetailsAltumRequest extends GetArticleDetailsBaseRequest { }

    interface GetArticleVariantsDetailsBaseRequest {
        articleId: number;
        properties: b2bShared.PropertyValuePreviewModel[];
    }
    interface GetArticleVariantsDetailsXlRequest extends GetArticleVariantsDetailsBaseRequest { }
    interface GetArticleVariantsDetailsAltumRequest extends GetArticleVariantsDetailsBaseRequest { }

    //------responses

    interface GetLastOrderResponse {
        isLastOrderPresent: boolean;
        lastOrderDetails: LastOrderDetailsResponse;
    }

    interface GetPlannedDeliveriesResponse {
        plannedDeliveries: PlannedDelivery[];
        isPlannedDeliveriesListPresent: boolean;
    }

    interface GetThresholdPriceListBaseResponse {
        constPriceThresholdPriceList: ConstThresholdPriceListBase[];
        hasAnyThresholdPriceList: boolean;
    }

    interface GetThresholdPriceListXlResponse extends GetThresholdPriceListBaseResponse {
        constPriceThresholdPriceList: ConstThresholdPriceListXl[];
        valuableThresholdPriceList: ValuableThresholdPriceListXl[];
        percentageThresholdPriceList: PercentageThresholdPriceListXl[];
    }

    interface GetThresholdPriceListAltumResponse extends GetThresholdPriceListBaseResponse {
        constPriceThresholdPriceList: ConstThresholdPriceListAltum[];
    }

    interface ConvertUnitsBaseResponse extends ProductPurchaseDetailsBase {
        objectExtension: b2bShared.ApiObjectExtensionOld;
    }

    interface ConvertUnitsXlResponse extends ConvertUnitsBaseResponse, ProductPurchaseDetailsXl { }
    interface ConvertUnitsAltumResponse extends ConvertUnitsBaseResponse, ProductPurchaseDetailsAltum { }
    type ConvertUnitsResponseBoth = ConvertUnitsXlResponse | ConvertUnitsAltumResponse;


    interface GetArticlePurchaseDetailsBaseResponse extends ProductPurchaseDetailsBase {
        unitsSummary: b2bShared.ArticleUnitPreview[];
        objectExtension: b2bShared.ApiObjectExtensionOld;
    }

    interface GetArticlePurchaseDetailsXlResponse extends GetArticlePurchaseDetailsBaseResponse, ProductPurchaseDetailsXl { }
    interface GetArticlePurchaseDetailsAltumResponse extends GetArticlePurchaseDetailsBaseResponse, ProductPurchaseDetailsAltum { }
    type GetArticlePurchaseDetailsResponseBoth = GetArticlePurchaseDetailsXlResponse | GetArticlePurchaseDetailsAltumResponse;

    interface GetAttributesBaseResponse {
        articleAttributes: ProductAttribute[];
        articleAttachments: b2bShared.Attachment[];
        articleImages: ProductImage[];
    }

    interface GetAttributesXlResponse extends GetAttributesBaseResponse { }
    interface GetAttributesAltumResponse extends GetAttributesBaseResponse { }
    type GetAttributesResponseBoth = GetAttributesXlResponse | GetAttributesAltumResponse;

    interface GetArticleGeneralInfoBaseResponse {
        articleGeneralInfo: ProductGeneralInfoBase;
        substituteList: SubstitutePreview[];
    }
    interface GetArticleGeneralInfoXlResponse extends GetArticleGeneralInfoBaseResponse {
        articleGeneralInfo: ProductGeneralInfoXl;
    }
    interface GetArticleGeneralInfoAltumResponse extends GetArticleGeneralInfoBaseResponse {
        articleGeneralInfo: ProductGeneralInfoAltum;
    }
    type GetArticleGeneralInfoResponseBoth = GetArticleGeneralInfoXlResponse | GetArticleGeneralInfoAltumResponse;

    interface GetArticleDetailsBaseResponse {
        articleDetailsType: ProductDetailsType;
        articleVariantProperties: b2bShared.PropertyValuePreviewModel[]
    }
    interface GetArticleDetailsXlResponse extends GetArticleDetailsBaseResponse { }
    interface GetArticleDetailsAltumResponse extends GetArticleDetailsBaseResponse { }
    type GetArticleDetailsResponseBoth = GetArticleDetailsXlResponse | GetArticleDetailsAltumResponse;

    interface GetArticleVariantsDetailsBaseResponse extends ProductVariantsSummary { }
    interface GetArticleVariantsDetailsXlResponse extends GetArticleVariantsDetailsBaseResponse { }
    interface GetArticleVariantsDetailsAltumResponse extends GetArticleVariantsDetailsBaseResponse { }
    type GetArticleVariantsDetailsResponseBoth = GetArticleVariantsDetailsXlResponse | GetArticleVariantsDetailsAltumResponse;

    //Other

    interface LastOrderDetailsResponse {
        issueDate: string;
        orderNumber: string;
        price: number;
        basicUnitPrice: number;
        currency: string;
        quantity: number;
        auxiliaryUnit: string;
        quantityInBasicUnit: number;
        basicUnit: string;
        isOrderInBasicUnit: boolean;
        orderId: number;
        vatDirection: VatDirectionEnum;
    }

    interface LastOrderDetails extends LastOrderDetailsResponse {
        unit: string;
        converter: string;
    }

    interface PlannedDelivery {
        plannedDate: string;
        quantityInBasicUnit: number;
        basicUnit: string;
        isPlannedDateUnspecified: boolean;
    }


    interface ConstThresholdPriceListBase {
        netPrice: number;
        grossPrice: number;
        currency: string;
        unit: string;
        unitId: number;
        thresholdQuantity: number;
    }

    interface ConstThresholdPriceListXl extends ConstThresholdPriceListBase { }
    interface ConstThresholdPriceListAltum extends ConstThresholdPriceListBase { }

    interface ValuableThresholdPriceListXl {
        netValue: number;
        grossValue: number;
        currency: string;
        thresholdQuantity: number;
    }
    interface PercentageThresholdPriceListXl {
        value: number;
        thresholdQuantity: number;
    }

    interface ThresholdPriceLists {
        hasAnyThresholdPriceList: boolean;
        constPriceThresholdPriceList: ConstThresholdPriceListBase[];
        valuableThresholdPriceList?: ValuableThresholdPriceListXl[];
        percentageThresholdPriceList?: PercentageThresholdPriceListXl[];
    }

    interface WeightAndVolume {
        bruttoWeight: number;
        nettoWeight: number;
        volume: number;
        volumeResourceSymbolKey: string;
        weightResourceSymbolKey: string;
    }

    interface ProductPurchaseDetailsBase extends Partial<ProductPurchaseDetailsExtension> {
        unit: b2bShared.ArticleUnits;
        price: b2bShared.PriceBase;
        stockLevel: b2bShared.RepresentsExistingValue<string>;
        weightAndVolume: WeightAndVolume;
        extensions: b2bShared.ApiObjectExtension;
        objectExtensions: b2bShared.ApiObjectExtensionOld;

    }

    interface ProductPurchaseDetailsExtension {
        //TODO temp solution - return stockLevel from API as number, not string
        stockLevelNumber: number;
    }

    interface ProductPurchaseDetailsXl extends ProductPurchaseDetailsBase {
        price: b2bShared.PriceXl;
    }

    interface ProductPurchaseDetailsAltum extends ProductPurchaseDetailsBase {
        price: b2bShared.PriceAltum;
    }

    type ProductPurchaseDetailsBoth = ProductPurchaseDetailsXl | ProductPurchaseDetailsAltum;
    type ProductPurchaseDetailsBothIntersection = ProductPurchaseDetailsXl & ProductPurchaseDetailsAltum;

    interface ProductsPurchaseDetailsCache {
        [productId: number]: { [warehouseId: number]: { [unitId: number]: ProductPurchaseDetailsBothIntersection } };
    }

    interface ProductsUnitsCache {
        [productId: number]: ProductUnitsSummary;
    }

    interface ProductUnitsSummary {
        [unitId: number]: string;
    }

    interface ProductsPurchaseDetailsSummaryCache {
        purchaseDetails: ProductsPurchaseDetailsCache;
        units: ProductsUnitsCache;
    }

    interface ProductPurchaseDetailsSummary {
        productId: number;
        purchaseDetails: ProductPurchaseDetailsBothIntersection;
        unitsSummary: ProductUnitsSummary;
        unitsLength: number;
        itemExistsInCurrentPriceList: boolean;
    }

    interface ProductAttribute {
        type: number;
        name: string;
        value: string;
    }

    interface ProductImage extends b2bShared.ImageBase {
        imageSrc?: string;
    }

    interface ProductAttributesSummary {
        articleAttributes: ProductAttribute[];
        articleAttachments: b2bShared.Attachment[];
        articleImages: ProductImage[];
    }

    interface ProductGeneralInfoBase {
        article: b2bShared.ArticleBase;
        permissions: ProductPermissions;
        articleBasicDetails: ProductBasicDetails;
        objectExtension: b2bShared.ApiObjectExtensionOld;
    }
    interface ProductGeneralInfoXl extends ProductGeneralInfoBase {
        article: b2bShared.ArticleXl;
    }
    interface ProductGeneralInfoAltum extends ProductGeneralInfoBase {
        article: b2bShared.ArticleAltum;
    }

    type ProductGeneralInfoBoth = ProductGeneralInfoXl | ProductGeneralInfoAltum;
    type ProductGeneralInfoBothIntersection = ProductGeneralInfoXl & ProductGeneralInfoAltum;

    interface ProductBasicDetails extends ProductAvailabilityDetails {
        description: string;
        manufacturer: string;
        manufacturerUrl: string;
        manager: string;
        managerMail: string;
        brand: string;
        articleGroupId: number;
        ean: string;
        flag: number;
    }

    interface ProductAvailabilityDetails {
        status: ProductStatus;
        availabilityStatus: ProductAvailabilityStatus;
        availableFrom: string;
    }

    interface ProductPermissions {
        showLastOrder: boolean;
        showPlannedDeliveries: boolean;
        showArticleThresholdPrices: boolean;
    }

    interface SubstitutePreview {
        articleId: number;
        substituteId: number;
    }

    interface ProductDetailsLoadingSummary {
        purchaseDetailsLoading?: boolean;
        galleryLoading?: boolean;
        attributesLoading?: boolean;
        generalInfoLoading?: boolean;
        nameLoading?: boolean;
        flagLoading?: boolean;
    }

    interface ProductVariant {
        header: ProductVariantHeader;
        values: ProductVariantValue[];
    }

    interface ExpandedProductVariant {
        header: ProductVariantHeader;
        expandedValues: ExpandedProductVariantValue[];
    }

    interface ProductVariantHeader {
        propertyId: number;
        translatedName: string;
    }

    interface ExpandedProductVariantValue {
        articleId: number;
        articleStatus: ProductStatus;
        articleType: number;
        value: ProductVariantValue;
    }

    interface ProductVariantValue {
        valueId: number;
        translatedName: string;
        status: OptionBaseStatus;
    }

    interface ProductVariantsSummary {
        headerVariants: ProductVariant[];
        expandedVariant: ExpandedProductVariant;
    }

    interface ExpandedProductVariantGridRow extends Partial<ProductPurchaseDetailsSummary> {
        productId: number;
        productStatus: ProductStatus;
        productType: number;
        variantValue: ProductVariantValue;
        loading: boolean;
        currentQuantity: number;
        currentUnitId?: number;
    }

    interface ProductVariantSummary {
        [productId: number]: ProductVariantPreview;
    }
    interface ProductVariantPreview {
        productId: number;
        quantity: number;
        unitId: number;
    }

    interface ProductVariantAddToCartModel {
        cartId: number;
        variantsPreviewModels: ProductVariantPreview[];
    }

    interface ProductVariantAddToStoreModel {
        storeId: number;
        variantsPreviewModels: ProductVariantPreview[];
    }
    interface UnitChangedModel {
        productId: number;
        unitId: number;
    }

    interface WarehouseChangedModel {
        productId: number;
        warehouseId: number;
        unitId: number;
    }

    interface UpdatePropertiesDetailsRequestModel extends UpdateExtraPropertiesDetailsRequestModel {
        groupId: number;
    }

    interface UpdateExtraPropertiesDetailsRequestModel {
        productId: number;
        currency: string;
        vatValue: number;
        warehouseId: number;
    }

    interface ChangeProductVariantModel {
        productId: number;
        purchaseDetails: ProductPurchaseDetailsBothIntersection;
    }

    interface BaseModalData {
        isOpened: boolean;
        autoClose: boolean;
        autoCloseTimeout?: number;
    }

    interface ProductVariantsNotificationModalData extends BaseModalData {
        status?: ProductVariantsModalStatus;
    }
}
