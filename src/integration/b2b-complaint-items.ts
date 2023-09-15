import { b2bShared } from './b2b-shared';
import { b2bCommon } from './shared/b2b-common';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bComplaintItems {


    export interface ListRequest extends b2bDocuments.SharedRequestParams {
        filter: string;
        documentId: number;	
    }

    export interface FilteringOptions extends b2bDocuments.SharedFilteringOptions {
        filter: string;
        documentId: number;	
    }

    export interface Summary {
        number: number;
        showCode: true;
        showImages: true;
    }

    export interface PurchaseDocumentsRequestParams {
        filter: string;
        dateFrom: b2bCommon.DateISOString;
        dateTo: b2bCommon.DateISOString;
    }

    //responses

    export interface ListItemResponse extends b2bDocuments.ListItemBase {
        itemId: number;
        no: number;
        name: string;
        code: string;
        quantity: number;
        defaultUnitNo: number;
        auxiliaryUnit: string;
        unitConversion: string;
        isAvailable: 0 | 1;
        image: b2bShared.ImageBase;
        sourceDocumentName: string;
        sourceDocumentId: number;
        sourceDocumentType: number;
        attributes: b2bShared.PositionAttribute[];
    }


    export interface ListResponse extends b2bDocuments.NewListResponse<ListItemResponse, 'articlesToComplaint'> {
        summary: Summary;
    }

    
}
