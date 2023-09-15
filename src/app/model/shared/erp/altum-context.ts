import { HttpClient } from '@angular/common/http';
import { CustomerFilesRequests } from '../../files/customer-files-requests';
import { GroupsAltumRequests } from '../../groups/groups-altum-requests';
import { GroupsRequests } from '../../groups/groups-requests';
import { InquiriesAltumRequests } from '../../inquiries/inquiries-altum-requests';
import { InquiriesRequests } from '../../inquiries/inquiries-requests';
import { OrdersAltumRequests } from '../../orders/orders-altum-requests';
import { OrdersRequests } from '../../orders/orders-requests';
import { PaymentsAltumRequests } from '../../payments/payments-altum-requests';
import { PaymentsRequests } from '../../payments/payments-requests';
import { PendingAltumRequests } from '../../pending/pending-altum-requests';
import { PendingRequests } from '../../pending/pending-requests';
import { PromotionsAltumRequests } from '../../promotions/promotions-altum-requests';
import { QuotesAltumRequests } from '../../quotes/quotes-altum-requests';
import { QuotesRequests } from '../../quotes/quotes-requests';
import { ServiceJobsRequests } from '../../service-jobs/service-jobs-requests';
import { ProductBaseAltumRequests } from '../product-base/product-base-altum-requests';
import { ProductBaseRequests } from '../product-base/product-base-requests';
import { ERPContext } from './erpcontext';

export class AltumContext implements ERPContext {

  productBase: ProductBaseRequests;
  groups: GroupsRequests;
  orders: OrdersRequests;
  inquiries: InquiriesRequests;
  quotes: QuotesRequests;
  payments: PaymentsRequests;
  serviceJobs: ServiceJobsRequests;
  pending: PendingRequests;
  customerFiles: CustomerFilesRequests;
  promotions: PromotionsAltumRequests;
  
  constructor(httpClient: HttpClient) {
    this.productBase = new ProductBaseAltumRequests(httpClient);
    this.groups = new GroupsAltumRequests(httpClient);
    this.orders = new OrdersAltumRequests(httpClient);
    this.inquiries = new InquiriesAltumRequests(httpClient);
    this.quotes = new QuotesAltumRequests(httpClient);
    this.payments = new PaymentsAltumRequests(httpClient);
    this.serviceJobs = new ServiceJobsRequests(httpClient);
    this.pending = new PendingAltumRequests(httpClient);
    this.customerFiles = new CustomerFilesRequests(httpClient);
    this.promotions = new PromotionsAltumRequests(httpClient);

  }
  
  
  

}
