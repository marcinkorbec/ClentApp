import { b2bShared } from './b2b-shared';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bOrders {

    export interface ListRequest extends b2bDocuments.SharedDocumentRequestParams {
        documentNumberFilter: string;
        documentOwnNumberFilter: string;
    }

    export interface ListItem extends ListItemResponse {
        displayedExpectedDate: string;
    }

    export interface FilteringOptions extends b2bDocuments.SharedDocumentFilteringOptions {
        documentNumberFilter: string;
        documentOwnNumberFilter: string
    }

    //responses

    type ListResponse = b2bDocuments.NewListResponse<ListItemResponse, 'orderList'>;

    export interface ListItemResponse extends b2bDocuments.ListItemBase {
        id: number;
        number: string;
        sourceNumber: string;
        customer: string;
        issueDate: string;
        expectedDate: string;
        state: number;
        stateResourceKey: string;
        deliveryMethod: string;
        completionEntirely: 0 | 1;
        isCancelled: boolean;
        isConfirmed: boolean;
        isExpectedDateUnspecified: boolean;
        quotes: b2bDocuments.DocumentReference[];
    }

    export interface OrderHeader extends b2bDocuments.SharedDetailsHeader {
        customer: string;
        issueDate: string;
        expireDate: string;
        expectedDate: string;
        completionEntirely: number;
        paymentForm: string;
        dueDate: string;
        deliveryMethod: string;
        description: string;
        vatDirection: b2bShared.VatDirection;
        showCode: boolean;
        priceMode: number;
        showFeatures: boolean;
        precision: number;
        showDeliveryCost: boolean;
        totalWeight: number;
        volume: number;
        showImages: boolean;
        companyName: string;
        nameAndLastName: string;
        street: string;
        zipCode: string;
        city: string;
        isExpiryDateUnlimited: boolean;
        isExpectedDateUnspecified: boolean
    }

    export interface OrderItemResponse extends b2bDocuments.DocumentProductItem {
        warehouseId: number;
        feature: string;
        defaultUnitNo: number;
        translationFeature: string;
        completedQuantity: number;
        description: string;
        hasDetails: boolean;
        expectedDate: string;
        isAvailable: boolean;
        id: number;
    }

    export interface OrderDetailsItem extends OrderItemResponse {
        basicUnitPrice: number;
        basicUnit: string;
        collapsedDescription: string;
        isDescriptionOverflow: boolean;
    }

    export interface DetailsResponse {
        orderHeader: OrderHeader;
        orderItems: OrderItemResponse[];
        orderSummary: b2bDocuments.DetailsSummary[];
        orderAttachments: b2bShared.Attachment[];
        orderRelatedDocuments: b2bDocuments.DocumentReference[];
        orderPermissionsAndBehaviour: PermissionsAndBehaviour;
        attributes: b2bShared.Attrubute[];
    }

    export interface PermissionsAndBehaviour {
        canConfirm: boolean;
        canRemove: boolean;
        creditLimitBehaviour: CreditLimitBehaviourEnum;
    }

}
