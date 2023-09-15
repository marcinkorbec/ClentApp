import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Config } from 'src/app/helpers/config';
import { b2b } from 'src/b2b';
import { b2bPayments } from 'src/integration/b2b-payments';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { CartsService } from '../carts.service';
import { ConfigService } from '../config.service';
import { DocumentTypes } from '../enums/document-type.enum';
import { MenuService } from '../menu.service';
import { DocumentDetailsBase } from '../shared/documents/document-details-base';
import { DocumentDetailsCart } from '../shared/documents/document-details-cart';
import { DocumentDetailsRelatedDocuments } from '../shared/documents/document-details-related-documents';
import { DocumentDetailsWithType } from '../shared/documents/document-details-with-type';
import { ERPService } from '../shared/erp/erp.service';
import { PrintHandlerService } from '../shared/printhandler.service';

@Injectable()
export class PaymentDetailsService extends DocumentDetailsBase<b2bPayments.PaymentHeaderUI, b2bPayments.PaymentItemResponse, b2bPayments.Details>
implements DocumentDetailsWithType<b2bPayments.Details>, DocumentDetailsRelatedDocuments, DocumentDetailsCart {
    

    type: number;
    summaries: b2bPayments.PaymentSummary[];
    columns: b2bDocuments.ColumnConfig[];
    headerResource: string;
    relatedDocuments: b2bDocuments.DocumentReference[];

    constructor(
        private cartsService: CartsService,
        configService: ConfigService,
        private menuService: MenuService,
        printHandlerService: PrintHandlerService,
        private erpService: ERPService
    ) {
        super(configService, printHandlerService);

        this.headerResource = 'paymentDetails';

        this.columns = this.getColumns();
    }
    
    
    relatedDocumentLinkCreator(doc: b2bDocuments.DocumentReference): string[] {
        return [this.menuService.routePaths.orderDetails, doc.id + ''];
    }

    protected requestDetails(id = this.id, type = this.type): Observable<b2bPayments.Details> {
        return this.erpService.context.payments.details(id, type);
    }


    loadDetails(id = this.id, type = this.type): Observable<b2bPayments.Details> {


        return this.requestDetails(id, type).pipe(tap(res => {
            this.id = id;
            this.type = type;
            this.header = res.paymentHeader;

            this.items = res.paymentItems.map(item => {
                const discount = Number(item.discount) === 0 ? '' : item.discount + ' %';
                const newItem = Object.assign(item, {discount});
                this.fillProductImageIfPossible(newItem, item.image.imageId, item.image.imageUrl, item.image.imageType);
                return newItem;
            });

            this.summaries = res.paymentSummary;
            this.relatedDocuments = res.paymentRelatedDocuments;
            this.attachments = res.paymentAttachments;
            this.attributes = res.attributes;

            this.columns = this.getColumns();

            return res;

        }));
    }

    private getColumns(): b2bDocuments.ColumnConfig[] {

        
        const complaintColumn: b2bDocuments.ColumnConfig = { property: 'complain', translation: ' ', type: 'complain' };

        let columns: b2bDocuments.ColumnConfig[] = this.columns || [
            { property: 'position', translation: 'ordinalNumber' },
            { property: 'name', translation: 'codeName', type: 'productName' },
            { property: 'price', translation: 'grossPrice', type: 'price' },
            { property: 'discount', type: 'percent' },
            { property: 'vatRate', translation: 'vat' },
            { property: 'quantity', type: 'quantity' },
            { property: 'netValue', type: 'price', summaryProperty: 'net' },
            { property: 'grossValue', type: 'price', summaryProperty: 'gross' },
            { property: 'currency' },
        ];


        if (this.header) {

            if (this.header.canComplaint && !columns.find(col => col.property === 'complain')) {
                columns.push(complaintColumn);
            } else if (!this.header.canComplaint) {
                columns = columns.filter(col => col.property !== 'complain');
            }

            this.changePriceLabelBasedOnVatDirection(this.header.vatDirection);
        }
        
        return columns;
    }


    copyToCart(cartId: number): Observable<void> {

        const body: b2b.CopyPaymentToCartRequest = {
            cartId: cartId,
            documentId: this.id,
            documentTypeId: this.type,
            pageId: DocumentTypes.payment,
            createNewCart: cartId === Config.createNewCartId,
        };

        return from(this.cartsService.copyToCart(body));
    }

    print() {
        return super.printHelper(DocumentTypes.payment, this.id, this.type, this.header.isClip);
    }

    relatedDocumentTranslationKey(): string {
        return 'orders';
    }

    getItemId(item: b2bPayments.PaymentItemResponse): number {
        return item.id;
    }
}
