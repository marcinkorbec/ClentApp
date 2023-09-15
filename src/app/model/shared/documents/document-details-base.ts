import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Config } from 'src/app/helpers/config';
import { b2bShared } from 'src/integration/b2b-shared';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { ConfigService } from '../../config.service';
import { BoxMessageClass } from '../enums/box-message-class.enum';
import { BoxMessageType } from '../enums/box-message-type.enum';
import { ImageType } from '../enums/image-type.enum';
import { PrintHandlerService } from '../printhandler.service';
import { DocumentDetailsContextBase } from './document-details-context-base';

type responseBase = b2bDocuments.DetailsResponseBase<b2bDocuments.SharedDetailsHeader, b2bDocuments.DocumentProductItem>;

export abstract class DocumentDetailsBase<listHeader extends b2bDocuments.SharedDetailsHeaderBase, listItem extends b2bDocuments.DocumentDetailsItemBase, response extends responseBase> 
implements DocumentDetailsContextBase<listHeader, listItem, response>, Resolve<DocumentDetailsContextBase<listHeader, listItem, response>> {
    
    id: number;
    header: listHeader;
    items: listItem[];
    attachments: b2bShared.Attachment[];
    attributes: b2bShared.Attrubute[];
    detailsBoxMessages: b2bShared.BoxMessages;
    abstract columns: b2bDocuments.ColumnConfig[];
    abstract headerResource: string;

    constructor(protected configService: ConfigService, private printHandlerService: PrintHandlerService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): DocumentDetailsContextBase<listHeader, listItem, response> {
        return this;
    }

    protected abstract requestDetails(id: number): Observable<response>;

    protected loadDetailsBase(id: number, propertyNames?: b2bDocuments.PropertyNames) {

        return this.requestDetails(id).pipe(tap(res => {
            this.id = id;

            if (propertyNames.headerProperty) {
                this.header = res[propertyNames.headerProperty];
            }

            if (propertyNames.itemsProperty) {
                this.items = res[propertyNames.itemsProperty];
            }

            if (propertyNames.attachmentsProperty) {
                this.attachments = res[propertyNames.attachmentsProperty];
            }

            this.attributes = res.attributes;
            return res;
        }));
    }

    loadDetails(id: number) {
        return this.loadDetailsBase(id);
    }

    printHelper(pageId: number, documentId: number, documentTypeId?: number, documentMode?: number): Observable<void> {
        this.configService.loaderSubj.next(true);

        return from(this.printHandlerService.print(pageId, documentId, documentTypeId, documentMode)).pipe(
            tap(() => {
                this.configService.loaderSubj.next(false);
            }),
            catchError((err) => {
                this.detailsBoxMessages = this.preparePrintBoxMessages();
                this.configService.loaderSubj.next(false);
                return of(err);
            })
        );
    }

    abstract print(): Observable<void>;

    private preparePrintBoxMessages(): b2bShared.BoxMessages {
        return <b2bShared.BoxMessages>{ boxMessageClass: BoxMessageClass.Danger, messages: [BoxMessageType.PrintFailed], showBoxMessage: true };
    }

    clearDetailsBoxMessages() {
        this.detailsBoxMessages = null;
    }

    protected fillProductImageIfPossible(currentProduct: any, imageId: number, imageUrl: string, imageType: ImageType): void {
        if (currentProduct) {
            currentProduct.image = this.prepareImageBase(imageId, imageUrl, imageType);
            currentProduct.imageHeight = Config.defaultArticleTableItemImageHeight;
            currentProduct.imageWidth = Config.defaultArticleTableItemImageWidth;
        }
    }

    private prepareImageBase(imageId: number, imageUrl: string, imageType: ImageType): b2bShared.ImageBase {
        return { imageId, imageUrl, imageType };
    }

    /**
     * Different property names in documents.
     * Gets item id from proper property.
     */
    abstract getItemId(item: listItem): number;

    changePriceLabelBasedOnVatDirection(vatDirection: b2bShared.VatDirection) {
        const priceColumn = this.columns.find(col => col.property === 'price');
        if (priceColumn) {
            priceColumn.translation = vatDirection === 'B' ? 'grossPrice' : 'netPrice';
        }
        
    }
}
