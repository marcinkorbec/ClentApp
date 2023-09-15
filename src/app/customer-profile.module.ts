import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerDataComponent } from './components/customer-data/customer-data.component';
import { OrdersService } from './model/orders/orders.service';
import { ComplaintFormComponent } from './components/complaint-form/complaint-form.component';
import { SharedModule } from './shared.module';
import { b2b } from '../b2b';
import { PromotionsComponent } from './components/promotions/promotions.component';
import { NewsComponent } from './components/news/news.component';
import { NewsDetailsComponent } from './components/news-details/news-details.component';
import { NewsService } from './model/news.service';
import { MenuService } from './model/menu.service';
import { ServiceJobDetailsComponent } from './components/service-job-details/service-job-details.component';
import { StoreComponent } from './components/store/store.component';
import { ShippingAddressListComponent } from './components/customer-data/shipping-address-list/shipping-address-list.component';
import { OrderDetailsService } from './model/orders/order-details.service';
import { InquiryDetailsService } from './model/inquiries/inquiry-details.service';
import { InquiriesService } from './model/inquiries/inquiries.service';
import { QuoteDetailsService } from './model/quotes/quote-details.service';
import { QuotesService } from './model/quotes/quotes.service';
import { PaymentsService } from './model/payments/payments.service';
import { PaymentDetailsService } from './model/payments/payment-details.service';
import { DeliveryService } from './model/deliveries/delivery.service';
import { DeliveryDetailsService } from './model/deliveries/delivery-details.service';
import { ComplaintsService } from './model/complaints/complaints.service';
import { ComplaintProductsService } from './model/complaints/complaint-products.service';
import { ComplaintDetailsService } from './model/complaints/complaint-details.service';
import { ServiceJobsService } from './model/service-jobs/service-jobs.service';
import { ServiceJobDetailsService } from './model/service-jobs/service-job-details.service';
import { PendingService } from './model/pending/pending.service';
import { CustomerFilesService } from './model/files/customer-files.service';
import { DocumentsListComponent } from './components/document-list/documents-list.component';
import { DocumentDetailsComponent } from './components/document-details/document-details.component';
import { PromotionsService } from './model/promotions/promotions.service';
import { PromotionDetailsService } from './model/promotions/promotion-details.service';


const routes: b2b.RouteWithKey[] = [
    { path: '', redirectTo: 'orders', pathMatch: 'full'},
    { path: 'orders', key: 'orders', component: DocumentsListComponent, resolve: { listContext: OrdersService } },
    { path: 'mydata', key: 'myData', component: CustomerDataComponent },
    { path: 'quotes', key: 'quotes', component: DocumentsListComponent, resolve: { listContext: QuotesService } },
    { path: 'inquiries', key: 'inquiries', component: DocumentsListComponent, resolve: { listContext: InquiriesService } },
    { path: 'payments', key: 'payments', component: DocumentsListComponent, resolve: { listContext: PaymentsService } },
    { path: 'complaints', key: 'complaints', component: DocumentsListComponent, resolve: { listContext: ComplaintsService } },
    { path: 'delivery', key: 'delivery', component: DocumentsListComponent, resolve: { listContext: DeliveryService } },
    { path: 'orders/:id', key: 'orderDetails', component: DocumentDetailsComponent, resolve: { detailsContext: OrderDetailsService } },
    { path: 'payments/:id/:type', key: 'paymentDetails', component: DocumentDetailsComponent, resolve: { detailsContext: PaymentDetailsService } },
    { path: 'quotes/:id', key: 'quoteDetails', component: DocumentDetailsComponent, resolve: { detailsContext: QuoteDetailsService } },
    { path: 'inquiries/:id', key: 'inquiryDetails', component: DocumentDetailsComponent, resolve: { detailsContext: InquiryDetailsService } },
    {
        path: 'complaints', key: 'complaints', children: [
            { path: 'itemscomplaint', key: 'complaintItems', component: DocumentsListComponent, resolve: { listContext: ComplaintProductsService } },
            { path: 'complaintsubmission/:itemsComplaint', key: 'complaintForm', component: ComplaintFormComponent },
            { path: ':id', component: DocumentDetailsComponent, key: 'complaintDetails', resolve: { detailsContext: ComplaintDetailsService } },
        ]
    },

    { path: 'delivery/:id', component: DocumentDetailsComponent, key: 'deliveryDetails', resolve: { detailsContext: DeliveryDetailsService } },
    { path: 'employees', component: CustomerDataComponent, key: 'employees' },
    { path: 'pending', key: 'pending', component: DocumentsListComponent, resolve: { listContext: PendingService } },
    { path: 'files', key: 'files', component: DocumentsListComponent, resolve: { listContext: CustomerFilesService } },
    { path: 'promotions', key: 'promotions', component: PromotionsComponent },
    {
        path: 'news', key: 'news', children: [
            { path: '', pathMatch: 'full', component: NewsComponent },
            { path: 'details/:id', key: 'newsDetails', component: NewsDetailsComponent }
        ]
    },
    { path: 'servicejobs', key: 'serviceJobs', component: DocumentsListComponent, resolve: { listContext: ServiceJobsService } },
    { path: 'servicejobs/:id', key: 'serviceJobDetails', component: ServiceJobDetailsComponent, resolve: { detailsContext: ServiceJobDetailsService } },

    {
        path: 'store', key: 'store', children: [
            { path: '', pathMatch: 'full', component: StoreComponent },
            { path: ':id', component: StoreComponent }
        ]
    }
];


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        CustomerDataComponent,
        ComplaintFormComponent,
        DocumentDetailsComponent,
        DocumentsListComponent,
        PromotionsComponent,
        NewsComponent,
        NewsDetailsComponent,
        ServiceJobDetailsComponent,
        StoreComponent,
        ShippingAddressListComponent
    ],
    providers: [
        InquiriesService,
        PaymentsService,
        QuotesService,
        ComplaintsService,
        ComplaintProductsService,
        DeliveryService,
        InquiryDetailsService,
        QuoteDetailsService,
        PaymentDetailsService,
        DeliveryDetailsService,
        ComplaintDetailsService,
        PendingService,
        OrdersService,
        CustomerFilesService,
        PromotionsService,
        PromotionDetailsService,
        NewsService,
        ServiceJobsService,
        ServiceJobDetailsService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CustomerProfileModule {
    constructor(menuService: MenuService) {
        menuService.configureRoutePaths(routes, 'profile');
    }
}
