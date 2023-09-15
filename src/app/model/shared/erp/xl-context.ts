import { HttpClient } from '@angular/common/http';
import { ComplaintsXlRequests } from '../../complaints/complaints-xl-requests';
import { DeliveryXlRequests } from '../../deliveries/delivery-xl-requests';
import { CustomerFilesRequests } from '../../files/customer-files-requests';
import { GroupsRequests } from '../../groups/groups-requests';
import { GroupsXlRequests } from '../../groups/groups-xl-requests';
import { InquiriesRequests } from '../../inquiries/inquiries-requests';
import { InquiriesXlRequests } from '../../inquiries/inquiries-xl-requests';
import { OrdersRequests } from '../../orders/orders-requests';
import { OrdersXlRequests } from '../../orders/orders-xl-requests';
import { PaymentsRequests } from '../../payments/payments-requests';
import { PaymentsXlRequests } from '../../payments/payments-xl-requests';
import { PendingRequests } from '../../pending/pending-requests';
import { PendingXlRequests } from '../../pending/pending-xl-requests';
import { PromotionsRequests } from '../../promotions/promotions-requests';
import { PromotionsXlRequests } from '../../promotions/promotions-xl-requests';
import { QuotesRequests } from '../../quotes/quotes-requests';
import { QuotesXlRequests } from '../../quotes/quotes-xl-requests';
import { ServiceJobsRequests } from '../../service-jobs/service-jobs-requests';
import { ProductBaseRequests } from '../product-base/product-base-requests';
import { ProductBaseXlRequests } from '../product-base/product-base-xl-requests';
import { ERPContext } from './erpcontext';


export class XLContext implements ERPContext {

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
  
  complaints: ComplaintsXlRequests; //XL only
  delivery: DeliveryXlRequests; //XL only

  constructor(httpClient: HttpClient) {

    this.productBase = new ProductBaseXlRequests(httpClient);
    this.groups = new GroupsXlRequests(httpClient);
    this.orders = new OrdersXlRequests(httpClient);
    this.inquiries = new InquiriesXlRequests(httpClient);
    this.quotes = new QuotesXlRequests(httpClient);
    this.payments = new PaymentsXlRequests(httpClient);
    this.delivery = new DeliveryXlRequests(httpClient);
    this.complaints = new ComplaintsXlRequests(httpClient);
    this.serviceJobs = new ServiceJobsRequests(httpClient);
    this.pending = new PendingXlRequests(httpClient);
    this.customerFiles = new CustomerFilesRequests(httpClient);
    this.promotions = new PromotionsXlRequests(httpClient);
  }
  
  
  
}
