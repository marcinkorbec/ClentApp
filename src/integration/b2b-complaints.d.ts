import { SourceDocumentNumberType } from 'src/app/model/shared/enums/source-document-number-type.enum';
import { b2bShared } from './b2b-shared';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bComplaints {


    export interface ListRequest extends b2bDocuments.SharedDocumentRequestParams {
        documentNumberFilter: string;
        documentOwnNumberFilter: string;
    }

    export interface FilteringOptions extends b2bDocuments.SharedDocumentFilteringOptions {
        documentNumberFilter: string;
        documentOwnNumberFilter: string;
    }

    /**
     * format: {itemId}:{sourceDocumentId}:{productNo}
     */
    export type complaintParamString = string;

    //responses

    export interface ListItemResponse extends b2bDocuments.ListItemBase {
        articlesCount: number;
        id: number;
        number: string;
        sourceNumber: string;
        state: string;
        statusResourceKey: string;
        issueDate: string;
        modificationDate: string;
        sourceDocuments: b2bDocuments.PaymentReference[];
    }

    export type ListResponse = b2bDocuments.NewListResponse<ListItemResponseb, 'complaintList'>;


    export interface ComplaintHeaderResponse extends b2bDocuments.SharedDetailsHeader {

        issueDate: string;
        considerationDate: string;
        modificationDate: string;
        description: string;
        showCode: boolean;
        priceMode: number;
        precision: number;
        showImages: boolean;
        itemsCount: number;
        extensions: b2bShared.ApiObjectExtension;
    }

    export interface ComplaintHeader extends ComplaintHeaderResponse {
        copyToCartDisabled: boolean;
    }

    export interface ComplaintCompletion {
        operationId: number;
        date: string;
        state: number;
        name: string;
        description: string
    }

    export interface ComplaintItem extends b2bDocuments.DocumentProductItem {
        basicUnit: string;
        purchaseDocument: string;
        request: string;
        reason: string;
        isAvailable: number;
        sourceDocumentName: string;
        sourceDocumentId: number;
        sourceDocumentType: SourceDocumentNumberType;
        completion: ComplaintCompletion[];

        /**
         * product id
         */
        itemId: number;

        /**
         * not product id
         */
        id:number;
    }

    export interface DetailsResponse {
        complaintHeader: ComplaintHeaderResponse;
        complaintItems: ComplaintItem[];
        complaintAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attrubute[];
    }


    export interface ComplaintFormItem {
        itemId: number;
        image: b2bShared.CommonImage;
        sourceDocumentName: string;
        sourceDocumentId: number;
        sourceDocumentType: SourceDocumentNumberType;
        isUnitTotal: 0 | 1;
        name: string;
        code: string;
        basicQuantity: number;
        quantity: number;
        numerator: number;
        denominator: number;
        defaultUnitNo: number;
        basicUnit: string;
        auxiliaryUnit: string;
        unitConversion: string;
        price: number;
        discount: number;
        vatDirection: string;
        precision: number;
        currency: string;
        subtotalValue: number;
        totalValue: number;
        isAvailable: number;
        attributes: b2bShared.Attrubute[];
        extensions: b2bShared.ApiObjectExtension;
    }

    export interface ComplaintFormSummary {
        showCode: boolean;
        priceMode: number;
        precision: number;
        showImages: boolean;
        itemsCount: number;
        extensions: b2bShared.ApiObjectExtension;
    }

    export interface FormDetails {
        complaintFormItems: ComplaintFormItem[];
        complaintFormSummary: ComplaintFormSummary;
    }

    export interface ComplainParameters {
        SourceNumber: string;
        Description: string;
        SourceDocumentTypeId: number;
        SourceDocumentId: number;
        SourceDocumentNo: number;
        Quantity: number;
        Reason: string;
        Request: number;
        AdditionalInformation: string;
        ArticleId: number;
    }

    export interface ComplainResponse {
        set1: (b2bDocuments.DocumentIDs & {isValidationFailed: boolean})[];
    }
}