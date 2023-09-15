import { b2bShared } from 'src/integration/b2b-shared';
import { b2bCart } from 'src/integration/b2b-cart';
import { b2b } from 'src/b2b';
import { StockLevelBehavoiurEnum } from '../app/model/cart/enums/stock-level-behavoiur.enum';
import { b2bDocuments } from './shared/b2b-documents';
import { PriceMode } from 'src/app/model/enums/price-mode.enum';
import { StockLevelMode } from 'src/app/model/enums/stock-level-mode.enum';

export module b2bQuotes {

    interface InCartBaseRequest {
        cartId: number;
    }

    interface AddToCartFromQuoteRequest {
        quoteId: number;
    }

    interface UpdateSourceNumberInCartRequest extends InCartBaseRequest {
        sourceNumber: string;
    }

    interface UpdateDescriptionInCartRequest extends InCartBaseRequest {
        description: string;
    }

    interface UpdateAddressInCartRequest extends InCartBaseRequest {
        shippingAddressId: number;
    }

    interface UpdateRealizationDateInCartRequest extends InCartBaseRequest {
        receiptDate: string;
    }

    interface UpdateRealizationInCartXlRequest extends InCartBaseRequest {
        completionEntirely: number;
    }

    interface UpdateDeliveryMethodInCartRequest extends InCartBaseRequest {
        deliveryMethod: string;
    }

    interface UpdatePaymentFormInCartRequest extends InCartBaseRequest {
        paymentFormId: number;
    }

    interface UpdatePaymentDateInCartRequest extends InCartBaseRequest {
        paymentDate: string;
    }

    interface UpdateWarehouseInCartRequest extends InCartBaseRequest, b2bShared.PaginationRequestParams {
        warehouseId: number;
    }

    interface UpdateItemQuantityInCartBaseRequest extends InCartBaseRequest {
        itemId: number;
        quantity: number;
    }
    interface UpdateItemQuantityInCartXlRequest extends UpdateItemQuantityInCartBaseRequest { }
    interface UpdateItemQuantityInCartAltumRequest extends UpdateItemQuantityInCartBaseRequest { }

    interface RemoveCartFromQuoteRequest extends InCartBaseRequest { }


    interface UpdateItemDescriptionInCartXlRequest extends b2bCart.UpdateItemDescriptionBaseRequest { }
    interface UpdateItemDescriptionInCartAltumRequest extends b2bCart.UpdateItemDescriptionBaseRequest { }


    export interface FilteringOptions extends b2bDocuments.SharedDocumentFilteringOptions {
        documentNumberFilter: string;
        documentOwnNumberFilter: string;
        valid: boolean
    }

    export interface ListRequest extends b2bDocuments.SharedDocumentRequestParams {

    }

    //-----------responses-----------

    export interface ListItemResponse extends b2bDocuments.ListItemBase {
        expirationDate: string;
        id: number;
        inquiryId: number;
        inquiryNumber: string;
        issueDate: string;
        orders: b2bDocuments.DocumentReference[];
        sourceNumber: string;
        state: number;
        stateResourceKey: string
    }

    export type ListResponse = b2bDocuments.NewListResponse<ListItemResponse, 'quoteList'>;


    interface AddToCartFromQuoteResponse extends b2bCart.CartIdentifier { }

    interface UpdatePaymentFormInCartResponse {
        paymentDate: string;
    }

    interface UpdateWarehouseInCartResponse {
        items: b2bCart.CartItemStockLevelBase[];
        stockLevelModeBehaviour: StockLevelBehavoiurEnum;
    }

    interface UpdateItemQuantityInCartBaseResponse {
        cartItem: b2bCart.CartArticleListItemWithStockLevelBase;
        cartSummary: b2bCart.CartSummaryBase;
        stockLevelModeBehaviour: StockLevelBehavoiurEnum;
    }

    interface UpdateItemQuantityInCartXlResponse extends UpdateItemQuantityInCartBaseResponse {
        cartItem: b2bCart.CartArticleListItemWithStockLevelXl;
        cartSummary: b2bCart.CartSummaryXl;
    }

    interface UpdateItemQuantityInCartAltumResponse extends UpdateItemQuantityInCartBaseResponse {
        cartItem: b2bCart.CartArticleListItemWithStockLevelAltum;
        cartSummary: b2bCart.CartSummaryAltum;
    }

    // interface GetQuoteDetailsResponse {
    //     attachments: b2bShared.Attachment[];
    //     quoteDetails: b2b.QuoteDetailsBase;
    //     quoteValidationObject: QuoteDetailsValidation;
    // }

    interface QuoteDetailsValidation {
        isPermissionToQuoteRealize: boolean;
        showIncorrectStateOfQuoteWarning: boolean;
        showOutdatedQuoteWarning: boolean;
        showRealizedQuoteWarning: boolean;
    }

    interface QuoteHeaderResponse extends b2bDocuments.SharedDetailsHeader {
        isEditable: boolean;
        issueDate: string;
        expirationDate: string;
        expectedDate: string;
        completionEntirely: number;
        daysAfterOrder: number;
        paymentForm: string;
        dueDate: string;
        deliveryMethod: string;
        inquiryId: number;
        inquiryNumber: string;
        description: string;
        vatDirection: b2bShared.VatDirection;
        reasonForRejectionId: number;
        reasonForRejectionName: string;
        createManyOrders: number;
        showCode: boolean;
        showState: boolean;
        stateMode: StockLevelMode;
        priceMode: PriceMode;
        stateAvailableColor: number;
        stateNoneColor: number;
        showDeliveryCost: boolean;
        totalWeight: number;
        volume: number;
        showImages: boolean;
        extensions: b2bShared.ApiObjectExtension;
    }

    interface QuoteHeader extends QuoteHeaderResponse {
        copyToCartDisabled: boolean;
    }

    interface QuoteValidationObject {
        showRealizedQuoteWarning: boolean;
        showOutdatedQuoteWarning: boolean;
        showIncorrectStateOfQuoteWarning: boolean;
        isPermissionToQuoteRealize: boolean;
    }

    interface QuoteItem extends b2bDocuments.DocumentProductItem {
        type: number;
        isUnitTotal: number;
        stockLevel: number;
        isAvailable: number;
        id: number;
    }

    interface DetailsResponse {
        quoteHeader: QuoteHeaderResponse;
        quoteItems: QuoteItem[];
        quoteValidationObject: QuoteValidationObject;
        quoteSummary: b2bDocuments.DetailsSummary[];
        quoteAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attrubute[];
    }

}
