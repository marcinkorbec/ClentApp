import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { b2b } from 'src/b2b';
import { CreditLimitBehaviourEnum } from '../shared/enums/credit-limit-behaviour.enum';
import { CartsService } from '../carts.service';
import { ConfigService } from '../config.service';
import { CacheService } from '../cache.service';
import { CustomerService } from '../customer.service';
import { PrintHandlerService } from '../shared/printhandler.service';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { Config } from 'src/app/helpers/config';
import { DocumentTypes } from '../enums/document-type.enum';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { ERPService } from '../shared/erp/erp.service';
import { DocumentDetails } from '../shared/documents/document-details';
import { b2bOrders } from 'src/integration/b2b-orders';
import { catchError, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { MenuService } from '../menu.service';
import { DocumentDetailsCart } from '../shared/documents/document-details-cart';
import { DocumentDetailsConfirm } from '../shared/documents/document-details-confirm';
import { DocumentDetailsRemove } from '../shared/documents/document-details-remove';
import { DocumentDetailsRelatedDocuments } from '../shared/documents/document-details-related-documents';
import { SwUpdate } from '@angular/service-worker';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable()
export class OrderDetailsService 
extends DocumentDetails<b2bOrders.OrderHeader, b2bOrders.OrderDetailsItem, b2bOrders.DetailsResponse> 
implements DocumentDetailsCart, DocumentDetailsConfirm, DocumentDetailsRemove, DocumentDetailsRelatedDocuments {

    relatedDocuments: b2bDocuments.DocumentReference[];
    columns: b2bDocuments.ColumnConfig[];
    headerResource: string;
    permissionsAndBehaviour: b2bOrders.PermissionsAndBehaviour;

    constructor(
        private router: Router,
        private cartsService: CartsService,
        configService: ConfigService,
        private cacheService: CacheService,
        private customerService: CustomerService,
        printHandlerService: PrintHandlerService,
        private erpService: ERPService,
        private menuService: MenuService,
        private swUpdate: SwUpdate
    ) {
        super(configService, printHandlerService);

        this.headerResource = 'orderDetails';

        this.columns = [
            { property: 'position', translation: 'ordinalNumber' },
            { property: 'name', translation: 'codeName', type: 'productName' },
            { property: 'expectedDate' },
            { property: 'price', translation: 'grossPrice', type: 'priceWithConverter', priceConverter: 'basicUnitPrice' },
            { property: 'discount', type: 'percent' },
            { property: 'quantity', translation: 'orderedQuantity', type: 'quantity' },
            { property: 'completedQuantity', classCondition: { valueEquals: 0, class: 'danger' } },
            { property: 'netValue', type: 'price', summaryProperty: 'net' },
            { property: 'grossValue', type: 'price', summaryProperty: 'gross' },
            { property: 'currency' }
        ];
    }
       

    protected requestDetails(id = this.id) {
        return this.erpService.context.orders.details(id);
    }

    loadDetails(id = this.id) {

        const propertyNames: b2bDocuments.PropertyNames = {
            headerProperty: 'orderHeader',
            summaryProperty: 'orderSummary',
            attachmentsProperty: 'orderAttachments'
        };

        return super.loadDetailsBase(id, propertyNames).pipe(tap(res => {

            this.items = res.orderItems.map(el => {

                const item: Partial<b2bOrders.OrderDetailsItem> = el;
                
                const converterParams = ConvertingUtils.splitConverterString(item.unitConversion);
                item.basicUnitPrice = ConvertingUtils.calculateBasicUnitPrice(item.price, converterParams.denominator, converterParams.numerator);
                item.basicUnit = converterParams.basicUnit;

                if (item.description && item.description.length > Config.collapsedDescriptionLength) {
                    item.collapsedDescription = item.description.slice(0, Config.collapsedDescriptionLength) + '...';
                    item.isDescriptionOverflow = true;
                } else {
                    item.collapsedDescription = item.description;
                    item.isDescriptionOverflow = false;
                }

                this.fillProductImageIfPossible(item, item.image.imageId, item.image.imageUrl, item.image.imageType);
                
                return item as b2bOrders.OrderDetailsItem;
                
            });

            this.relatedDocuments = res.orderRelatedDocuments;
            this.permissionsAndBehaviour = res.orderPermissionsAndBehaviour;

            if (this.permissionsAndBehaviour.creditLimitBehaviour !== CreditLimitBehaviourEnum.NothingToDo 
                || this.permissionsAndBehaviour.creditLimitBehaviour === CreditLimitBehaviourEnum.NothingToDo && this.permissionsAndBehaviour.canConfirm) {
                this.customerService.refreshCreditInfo();
            }

            this.changePriceLabelBasedOnVatDirection(this.header.vatDirection);

            
        }));

    }


    private requestConfirm() {
        return this.erpService.context.orders.confirm(this.id);
    }

    confirm() {

        return this.requestConfirm().pipe(
                tap(res => {

                    if (res.isConfirmed) {
                        this.customerService.refreshCreditInfo();
                        this.permissionsAndBehaviour.canConfirm = false;
                        this.permissionsAndBehaviour.canRemove = false;
                        this.permissionsAndBehaviour.creditLimitBehaviour = CreditLimitBehaviourEnum.NothingToDo;

                        
                    }

                    if (res.exceededCreditLimit) {
                        this.customerService.refreshCreditInfo();
                        this.permissionsAndBehaviour.canConfirm = false;
                        this.permissionsAndBehaviour.creditLimitBehaviour = CreditLimitBehaviourEnum.ShowErrorAndBlockOperation;
                    }

                    this.cacheService.clearCache('/api/orders');
                    return res;

            }),
            catchError((err: HttpErrorResponse) => {

                if (err.status === 500) {
                    this.cacheService.activateSwUpdate('/api/orders');
                }

                return of({
                    isConfirmed: true,
                    exceededCreditLimit: null
                });
            })
        );
    }

    private requrestRemove(): Observable<boolean> {
        return this.erpService.context.orders.remove(this.id);
    }

    remove(): Observable<boolean> {

        return this.requrestRemove().pipe(tap(res => {
            if (res) {

                return this.cacheService.clearCache('/api/orders').then(() => {
                    this.router.navigate([this.menuService.routePaths.orders]);
                    return res;
                });

            }
        }));
    }

    copyToCart(cartId: number) {
        const body: b2b.CopyOrderToCartRequest = {
            cartId: cartId,
            documentId: this.id,
            pageId: DocumentTypes.order,
            createNewCart: cartId === Config.createNewCartId,
        };

        return from(this.cartsService.copyToCart(body));
    }

    print() {
        return super.printHelper(DocumentTypes.order, this.id);
    }

    relatedDocumentLinkCreator(doc: b2bDocuments.DocumentReference): string[] {
        return [this.menuService.routePaths.quotes, doc.id + ''];
    }

    relatedDocumentTranslationKey(): string {
        return 'quotes';
    }

    getItemId(item: b2bOrders.OrderDetailsItem): number {
        return item.id;
    }

}
