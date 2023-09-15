import { b2bShared } from './b2b-shared';
import { b2bShared } from './b2b-shared';
import { b2bCommon } from './shared/b2b-common';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bServiceJobs {


    interface FilteringOptions extends b2bDocuments.SharedDocumentFilteringOptions {
        documentNumber: string;
        myDocumentNumber: string;
        stateId: number;
        statusId: number;
    }

    interface ListRequest extends b2bDocuments.SharedDocumentRequestParams {
        documentNumber: string;
        myDocumentNumber: string;
        statusId: number;
        stateId: number;
    }


    // responses


    interface ListItemResponseBase extends b2bDocuments.ListItemBase {
        id: number;
        documentNumber: string;
        myDocumentNumber: string;
        creationDate: string;
        realizationDate: string;
        stateResourceKey: string;
        status: string;
        plannedEndDate: string;
    }

    interface ListItemResponse extends ListItemResponseBase {
        objectExtension: b2bShared.ApiObjectExtensionOld;
        extensions: b2bShared.ApiObjectExtension;
    }

    interface ListItemUnified extends ListItemResponseBase {
        extensions: b2bShared.ApiObjectExtension;
    }

    //type ListResponse = b2bDocuments.NewListResponse<ListItemResponse, 'serviceJobs'>;

    interface ListResponse extends b2bDocuments.NewListResponse<ListItemResponse, 'serviceJobs'> {
        serviceJobs: ListItemResponse[];
    }

    //type ListResponseUnified = b2bDocuments.NewListResponse<ListItemUnified, 'serviceJobs'>;

    interface ListResponseUnified extends b2bDocuments.NewListResponse<ListItemResponseUnified, 'serviceJobs'> {
        serviceJobs: ListItemResponseUnified[];
    }

    interface ServiceJobHeaderBase {
        stateResourceKey: string;
        contractorName: string;
        contractorStreet: string;
        contractorPostalCode: string;
        contractorCity: string;
        paymentForm: string;
        paymentDate: b2bCommon.DateISOString;
        description: string;
        proceeds: number;
        id: number;
        creationDate: b2bCommon.DateISOString;
        realizationDate: b2bCommon.DateISOString;
        status: string;
        objectExtension: b2bShared.ApiObjectExtensionOld;
        extensions: b2bShared.ApiObjectExtension;
        plannedEndDate: b2bCommon.DateISOString;

    }

    interface ServiceJobHeaderResponse extends ServiceJobHeaderBase {
        documentNumber: string;
        myDocumentNumber: string;

    }

    interface ServiceJobHeader extends ServiceJobHeaderBase {
        number: string;
        sourceNumber: string;
    }

    interface ServiceJobImage extends b2bShared.ImageBase {
        default: 0;
    }

    interface DeviceResponse {
        id: number;
        position: number;
        code: string;
        name: string;
        type: string;
        description: string;
        mileage: number;
        mileageUnit: string;
        group: string;
        number: number;
        haveElements: boolean;
        isArticle: boolean;
        objectExtension: b2bShared.ApiObjectExtensionOld;
        extensions: b2bShared.ApiObjectExtension;
    }

    interface Device extends DeviceResponse {
        /**
         * lazy loaded actions
         */
        actions?: DeviceAction[]; 
    }

    interface DetailsResponse extends ServiceJobHeaderResponse {
        devices: DeviceResponse[];
        images: ServiceJobImage[];
        attributes: b2bShared.Attrubute[];
        attachments: b2bShared.Attachment[];
    }

    interface DetailsUnified {
        serviceJobHeader: ServiceJobHeader;
        serviceJobItems: DeviceResponse[];
        serviceJobAttachments: b2bShared.Attachment[];
        attributes: b2bShared.Attrubute[];
    }

    interface DeviceActionResponse {
        id: number;
        position: number;
        completed: number;
        description: string;
        costType: number;
        quantity: number;
        priceAfterRebate: number;
        valueAfterRebate: number;
        rebate: number;
        currency: string;
        itemName: string;
        itemNumber: number;
        itemType: number;
        status: string;
        dateFrom: b2bCommon.DateISOString;
        dateTo: b2bCommon.DateISOString;
        vatValue: number;
        objectExtension: b2bShared.ApiObjectExtensionOld;
        extensions: b2bShared.ApiObjectExtension;
    }

    interface DeviceAction extends DeviceActionResponse {
        /**
         * lazy loaded action details
         */
        details?: DeviceActionDetails;
    }

    interface Serviceman {
        id: number;
        firstName: string;
        secondName: string;
        surname: string;
        telephone: string;
        email: string;
        objectExtension: b2bShared.ApiObjectExtensionOld;
        extensions: b2bShared.ApiObjectExtension;
    }

    interface Part {
        /**
         * id of row, NOT product!
         * */
        id: number;
        position: number;
        description: string;
        costType: number;
        quantity: number;
        priceAfterRebate: number;
        valueAfterRebate: number;
        rebate: number;
        currency: string;
        itemNumber: number;
        itemName: string;
        itemType: number;
        objectExtension: b2bShared.ApiObjectExtensionOld;
        extensions: b2bShared.ApiObjectExtension;
    }

    interface DeviceActionDetails {
        id: number;
        position: number;
        completed: number;
        description: string;
        costType: number;
        quantity: number;
        priceAfterRebate: number;
        valueAfterRebate: number;
        rebate: number;
        currency: string;
        itemName: string;
        itemNumber: number;
        itemType: ProductType;
        status: string;
        dateFrom: b2bCommon.DateISOString;
        dateTo: b2bCommon.DateISOString;
        vatValue: number;
        objectExtension: b2bShared.ApiObjectExtensionOld;
        extensions: b2bShared.ApiObjectExtensionOld;
        serviceman: Serviceman[];
        parts: Part[];
    }

    interface Payment {
        id: number;
        documentNumber: string;
        currency: string;
        netValue: number;
        date: b2bCommon.DateISOString;
        type: number;
        objectExtension: b2bShared.ApiObjectExtensionOld;
        extensions: b2bShared.ApiObjectExtension;
    }

}