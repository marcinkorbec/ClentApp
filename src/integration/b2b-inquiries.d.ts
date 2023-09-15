import { b2b } from 'src/b2b';
import { b2bShared } from './b2b-shared';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bInquiries {


    export interface ListRequest extends b2bDocuments.SharedDocumentRequestParams {

    }

    export interface FilteringOptions extends b2bDocuments.SharedDocumentFilteringOptions {
        documentNumberFilter: string;
        documentOwnNumberFilter: string
    }

    export interface PermissionsAndBehaviour {
        canRemove: boolean;
        showDetails: boolean;
    }

    //responses 

    export interface ListItemResponse extends b2bDocuments.ListItemBase {
        description: string;
        id: number;
        issueDate: string;
        number: string;
        sourceNumber: string;
        state: number;
        stateResourceKey: string
    }

    export type ListResponse = b2bDocuments.NewListResponse<ListItemResponse, 'inquiryList'>;

    export interface InquiryHeaderReponse extends b2bDocuments.SharedDetailsHeader {
        applicationId: number;
        description: string;
        issueData: string;
    }

    export interface InquiryHeader extends InquiryHeaderReponse {
        copyToCartDisabled: boolean;
    }

    export interface InquiryItemXL extends b2bDocuments.DocumentDetailsItemBase {
        description: string;
    }

    export interface InquiryItemAltum extends b2bDocuments.DocumentDetailsItemBase {
        auxiliaryUnit: string;
        basicUnit: string;
        code: string;
        defaultUnitNo: number;
        denominator: number;
        numerator: number;
        id: number;
        isAvailable: boolean;
        isUnitTotal: 0 | 1;
        name: string;
        position: number;
        quantity: number;
        unitPrecision: number;
        attributes: b2bShared.Attrubute[];
    }

    export interface DetailsResponseXL {
        inquiryHeader: InquiryHeaderReponse;
        inquiryAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attrubute[];
    }

    export interface DetailsResponseAltum {
        inquiryHeader: InquiryHeaderReponse;
        inquiryItems: InquiryItemAltum[];
        inquiryAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attrubute[];
    }

    export interface DetailsResponseUnified {
        inquiryHeader: InquiryHeaderReponse;
        inquiryItems: (InquiryItemAltum | InquiryItemXL)[];
        inquiryAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attrubute[];
        permissionsAndBehaviour: PermissionsAndBehaviour;
    }
}