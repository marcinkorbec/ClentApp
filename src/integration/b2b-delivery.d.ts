
import { b2bShared } from './b2b-shared';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bDelivery {
  

    export interface ListRequest extends b2bDocuments.SharedDocumentRequestParams {

    }

    export interface FilteringOptions extends b2bDocuments.SharedDocumentFilteringOptions {
        filter: string
    }


    //responses 

    export interface ListItemResponse extends b2bDocuments.ListItemBase {
        id: number;
        number: string;
        state: number;
        statusResourceKey: string;
        createdDate: string;
        articlesCount: number;
        deliveryAddress: string;
        waybill: string;
        isLink: boolean;
        waybillLink: string
    }

    export type ListResponse = b2bDocuments.NewListResponse<ListItemResponse, 'deliveryList'>;

    export interface DeliveryHeaderResponse extends b2bDocuments.SharedDetailsHeader {
        number: string;
        state: number;
        stateResourceKey: string;
        deliveryAddress: string;
        createdDate: string;
        weight: number;
        weightUnit: string;
        volume: number;
        deliverer: string;
        waybill: string;
        description: string;
        showImages: boolean;
        showCode: boolean;
        extensions: b2bShared.ApiObjectExtension;
    }

    export interface DeliveryHeader extends DeliveryHeaderResponse {
        isPrintingDisabled: boolean;
        copyToCartDisabled: boolean;
    }

    export interface DeliveryItem extends b2bDocuments.DocumentProductItem {
        defaultUnitNo: number;
        sourceDocumentType: SourceDocumentNumberType;
        sourceDocumentId: number;
        sourceDocumentName: string;
        isAvailable: number;
        itemId: number;
    }

    export interface DetailsResponse {
        deliveryHeader: DeliveryHeaderResponse;
        deliveryItems: DeliveryItem[];
        deliveryAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attrubute[];
        pagingResponse: b2b.PaginationConfig;
    }

}