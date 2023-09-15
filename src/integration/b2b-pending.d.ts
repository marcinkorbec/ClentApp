import { b2bCommon } from './shared/b2b-common';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bPending {

    export interface FilteringOptions extends b2bDocuments.SharedFilteringOptions {
        articleNameFilter: string;
        documentNumberFilter: string;
        documentOwnNumberFilter: string;
    }

    export interface ListRequest extends b2bDocuments.SharedRequestParams {
        articleNameFilter: string;
        documentNumberFilter: string;
        documentOwnNumberFilter: string;
    }

    // responses

    export interface ListItemResponse extends b2bDocuments.ListItemBase {
        id: number;
        number: string;
        sourceNumber: string;
        issueDate: string;
        expectedDate: string;
        name: string;
        code: string;
        itemId: number;
        defaultUnitNo: number;
        auxiliaryUnit: string;
        basicUnit: string;
        orderedQuantity: number;
        completedQuantity: number;
        quantityToComplete: number;
        numerator: number;
        denominator: number;
        isAvailable: boolean;
        image: b2bShared.ImageBase;
        attributes: b2bShared.PositionAttribute[];
    }

    export interface PendingListSummary {
        showCode: boolean;
        showImages: boolean;
        number: number
    }

    export interface ListResponse extends b2bDocuments.NewListResponse<ListItemResponse, 'pendingList'> {

        pendingListSummary: PendingListSummary;
        pendingFilter: {
            articleNameFilter: string;
            documentNumberFilter: string;
            documentOwnNumberFilter: string;
            dateFrom: b2bCommon.DateISOString;
            dateTo: b2bCommon.DateISOString
        }
    }
}