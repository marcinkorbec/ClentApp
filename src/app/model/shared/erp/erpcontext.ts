import { ComplaintsXlRequests } from '../../complaints/complaints-xl-requests';
import { DeliveryXlRequests } from '../../deliveries/delivery-xl-requests';
import { CustomerFilesRequests } from '../../files/customer-files-requests';
import { GroupsRequests } from '../../groups/groups-requests';
import { InquiriesRequests } from '../../inquiries/inquiries-requests';
import { OrdersRequests } from '../../orders/orders-requests';
import { PaymentsRequests } from '../../payments/payments-requests';
import { PendingRequests } from '../../pending/pending-requests';
import { PromotionsRequests } from '../../promotions/promotions-requests';
import { QuotesRequests } from '../../quotes/quotes-requests';
import { ServiceJobsRequests } from '../../service-jobs/service-jobs-requests';
import { ProductBaseRequests } from '../product-base/product-base-requests';

export interface ERPContext {

    productBase: ProductBaseRequests;
    groups: GroupsRequests;
    orders: OrdersRequests;
    inquiries: InquiriesRequests;
    quotes: QuotesRequests;
    payments: PaymentsRequests;
    serviceJobs: ServiceJobsRequests;
    pending: PendingRequests;
    customerFiles: CustomerFilesRequests;
    promotions: PromotionsRequests;

    complaints?: ComplaintsXlRequests; //XL only
    delivery?: DeliveryXlRequests; //XL only
}
