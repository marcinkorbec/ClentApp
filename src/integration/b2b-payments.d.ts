import { PaymentType } from 'src/app/model/payments/payment-type.enum';
import { b2b } from 'src/b2b';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { b2bShared } from './b2b-shared';

export module b2bPayments {


    export interface ListRequest extends b2bDocuments.SharedDocumentRequestParams {
        documentNumberFilter: string;
        documentOwnNumberFilter: string;
        paymentTypeId: PaymentType;
        currencyName: string;
        currencyId: number;
    }

    export interface FilteringOptions extends b2bDocuments.SharedDocumentFilteringOptions {
        documentNumberFilter: string;
        documentOwnNumberFilter: string;
        currencyId: number;
        currencyName: string;
        paymentTypeId: PaymentType;
    }

    //responses

    export interface ListItemResponse extends b2bDocuments.ListItemBase {
        type: number;
        id: number;
        issueDate: string;
        daysAfterDueDate: string;
        dueDate: string;
        number: string;
        amount: number;
        remaining: number;
        currency: string;
        paymentForm: string;
        sourceNumber: string;
        isPreview: 0 | 1;
        stateId: number;
        stateResourceKey: string;
    }

    export interface ListSummary {
        amount: number;
        remaining: number;
        currency: string;
    }

    export interface ListResponse extends b2bDocuments.NewListResponse<ListItemResponse, 'paymentList'> {
        paymentListSummary: ListSummary[];
    }

    export interface PaymentHeader extends b2bDocuments.SharedDetailsHeader {
        issueDate: string;
        saleDate: string;
        vatDirection: b2bShared.VatDirection;
        deliveryMethod: string;
        description: string;
        isClip: number;
        value: number;
        vatValue: number;
        currency: string;
        canComplaint: boolean;
        showCode: boolean;
        priceMode: PriceMode;
        showImages: boolean;
        isSplitPayment: boolean;
        extensions: b2bShared.ApiObjectExtension;
    }

    export interface PaymentItemResponse extends b2bDocuments.DocumentProductItem {
        /**
         * it's not product id
         */
        itemId: number;

        /**
         * product id
         */
        id: number;
        sourceDocumentName: string;
        sourceDocumentId: number;
        sourceDocumentType: number;
        no: number;
        defaultUnitNo: number;
        auxiliaryUnit: string;
        unitConversion: string;
        vatRate: string;
        warehouseId: number;
        isAvailable: number;
    }

    export interface PaymentItem extends PaymentItemResponse {
        discount: string;
    }

    export interface PaymentSummary {
        paymentForm: string;
        daysAfterDueDate: string;
        dueDate: string;
        amount: number;
        currency: string;
        extensions: b2bShared.ApiObjectExtension;
        remaining: number;
    }

    export interface PaymentSummaryUI {
        amount: number;
        currency: string;
        extensions: b2bShared.ApiObjectExtension;
        remaining: number;
    }

    
    export interface MissingHeaderProperties {
        paymentForm: string;
        daysAfterDueDate: string;
        dueDate: string;
    }

    export interface PaymentHeaderUI extends PaymentHeader, MissingHeaderProperties {

    }
    
    export interface DetailsResponse {
        paymentHeader: PaymentHeader;
        paymentItems: PaymentItemResponse[];
        paymentSummary: PaymentSummary;
        paymentRelatedDocuments: b2bDocuments.DocumentReference[];
        paymentAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attribute[];
    }

    export interface Details {
        paymentHeader: PaymentHeaderUI;
        paymentItems: PaymentItemResponse[];
        paymentSummary: PaymentSummary[];
        paymentRelatedDocuments: b2bDocuments.DocumentReference[];
        paymentAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attribute[];
    }

    

}