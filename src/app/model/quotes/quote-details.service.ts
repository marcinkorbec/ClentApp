import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UiUtils } from 'src/app/helpers/ui-utils';
import { b2bQuotes } from 'src/integration/b2b-quotes';
import { b2bShared } from 'src/integration/b2b-shared';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { CartsService } from '../carts.service';
import { ConfigService } from '../config.service';
import { AddToCartResponseEnum } from '../enums/add-to-cart-response-enum';
import { BoxMessageClass } from '../shared/enums/box-message-class.enum';
import { BoxMessageType } from '../shared/enums/box-message-type.enum';
import { PrintHandlerService } from '../shared/printhandler.service';
import { DocumentTypes } from 'src/app/model/enums/document-type.enum';
import { ERPService } from '../shared/erp/erp.service';
import { from, Observable, of } from 'rxjs';
import { DocumentDetails } from '../shared/documents/document-details';
import { catchError, tap } from 'rxjs/operators';
import { DocumentDetailsCart } from '../shared/documents/document-details-cart';
import { Config } from 'src/app/helpers/config';
import { b2b } from 'src/b2b';

@Injectable()
export class QuoteDetailsService extends DocumentDetails<b2bQuotes.QuoteHeader, b2bQuotes.QuoteItem, b2bQuotes.DetailsResponse>
implements DocumentDetailsCart {
    
    columns: b2bDocuments.ColumnConfig[];
    permissionsAndBehaviour: b2bQuotes.QuoteValidationObject;
    summaries: b2bDocuments.DetailsSummary[];
    headerResource: string;

    constructor(
        private cartsService: CartsService,
        configService: ConfigService,
        printHandlerService: PrintHandlerService,
        private erpService: ERPService
    ) {
        super(configService, printHandlerService);

        this.headerResource = 'quoteDetails';

        this.columns = [
            { property: 'position', translation: 'ordinalNumber' },
            { property: 'name', translation: 'codeName', type: 'productName' },
            { property: 'price', translation: 'grossPrice', type: 'price' },
            { property: 'quantity', type: 'quantity' },
            { property: 'netValue', type: 'price', summaryProperty: 'net' },
            { property: 'grossValue', type: 'price', summaryProperty: 'gross' },
            { property: 'currency' }
        ];
    }

    protected requestDetails(id = this.id): Observable<b2bQuotes.DetailsResponse> {
        return this.erpService.context.quotes.details(id);
    }

    loadDetails(id = this.id): Observable<b2bQuotes.DetailsResponse> {

        this.items = undefined;

        const propertyNames: b2bDocuments.PropertyNames = {
            headerProperty: 'quoteHeader',
            summaryProperty: 'quoteSummary',
            attachmentsProperty: 'quoteAttachments'
        };


        return super.loadDetailsBase(id, propertyNames).pipe(
            tap(res => {

                this.setProperPriceLabel();
                this.detailsBoxMessages = this.prepareBoxMessagesIfRequired(res.quoteValidationObject);

                this.permissionsAndBehaviour = res.quoteValidationObject;
                this.header.copyToCartDisabled = this.header.copyToCartDisabled || res.quoteValidationObject.isPermissionToQuoteRealize;

                this.items = res.quoteItems.map(item => {
                    const newItem = item;
                    this.fillProductImageIfPossible(newItem, item.image.imageId, item.image.imageUrl, item.image.imageType);
                    return newItem;
                });

                this.changePriceLabelBasedOnVatDirection(this.header.vatDirection);

                return res;
            })
        );
    }

    copyToCart(cartId?: number) {

        if (!cartId) {
            return this.realizeQuote();
        }

        const body: b2b.CopyQuoteToCartRequest = {
            cartId: cartId,
            documentId: this.id,
            pageId: DocumentTypes.order, //Intentionally, this is how it should be. It forcing standard prices.
            sourceNumber: this.header.sourceNumber,
            stateId: this.header.state,
            createNewCart: cartId === Config.createNewCartId,
        };

        return from(this.cartsService.copyToCart(body));
    }

    handleCartErrors(err: HttpErrorResponse) {

        if (err.status === 406) {
            this.detailsBoxMessages = this.prepareMessageInCaseAddToCartFailed(BoxMessageType.MaxNumberOfCartsReached, BoxMessageClass.Warning);
            this.configService.loaderSubj.next(false);
            UiUtils.scrollToTop();
            return Promise.resolve();
        }
        if (err.status === 409) {
            this.detailsBoxMessages = this.prepareMessageInCaseAddToCartFailed(BoxMessageType.UnavailableArticles, BoxMessageClass.Danger);
            this.configService.loaderSubj.next(false);
            UiUtils.scrollToTop();
            return Promise.resolve();
        }
    }

    realizeQuote() {
        this.configService.loaderSubj.next(true);
        this.detailsBoxMessages = undefined;
        const request: b2bQuotes.AddToCartFromQuoteRequest = {
            quoteId: this.id
        };

        return this.erpService.context.quotes.addToCartFromQuoteRequest(request).pipe(
            tap(res => {
                const status = this.cartsService.prepareAddToCartStatus(res, AddToCartResponseEnum.AllProductsAdded);
                this.cartsService.inCaseSuccessAddToCart(status);
                this.configService.loaderSubj.next(false);
                return res;
            }),
            catchError(err => {
                this.handleCartErrors(err);
                this.configService.loaderSubj.next(false);
                return of(err);
            })
        );
    }

    private prepareBoxMessagesIfRequired(quoteValidationObject: b2bQuotes.QuoteDetailsValidation): b2bShared.BoxMessages {
        const messageTypes: BoxMessageType[] = [];

        if (quoteValidationObject.showRealizedQuoteWarning) {
            messageTypes.push(BoxMessageType.QuoteIsCompleted);
        }

        if (quoteValidationObject.showOutdatedQuoteWarning) {
            messageTypes.push(BoxMessageType.ExpiredQuote);
        }

        if (quoteValidationObject.showIncorrectStateOfQuoteWarning) {
            messageTypes.push(BoxMessageType.UnconfirmedQuote);
        }

        if (messageTypes.length > 0) {
            return <b2bShared.BoxMessages>{ boxMessageClass: BoxMessageClass.Warning, messages: messageTypes, showBoxMessage: true };
        }
        return null;
    }

    private prepareMessageInCaseAddToCartFailed(messageType: BoxMessageType, messageClass: BoxMessageClass): b2bShared.BoxMessages {
        return <b2bShared.BoxMessages>{ boxMessageClass: messageClass, messages: [messageType], showBoxMessage: true };
    }

    print() {
        return super.printHelper(DocumentTypes.quote, this.id);
    }

    setProperPriceLabel() {

        const col = this.columns.find(el => el === 'price');
        if (!col) { return; }

        if (this.header.vatDirection === 'N') {
            col.translation = 'netPrice';
        }

        if (this.header.vatDirection === 'B') {
            col.translation = 'grossPrice';
        }
    }

    getItemId(item: b2bQuotes.QuoteItem): number {
        return item.id;
    }

}
