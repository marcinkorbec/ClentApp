import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { b2bDelivery } from 'src/integration/b2b-delivery';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { ConfigService } from '../config.service';
import { MenuService } from '../menu.service';
import { DocumentDetailsBase } from '../shared/documents/document-details-base';
import { DocumentDetailsPagination } from '../shared/documents/document-details-pagination';
import { SourceDocumentNumberType } from '../shared/enums/source-document-number-type.enum';
import { ERPService } from '../shared/erp/erp.service';
import { Pagination } from '../shared/pagination';
import { PrintHandlerService } from '../shared/printhandler.service';

@Injectable()
export class DeliveryDetailsService extends DocumentDetailsBase<b2bDelivery.DeliveryHeader, b2bDelivery.DeliveryItem, b2bDelivery.DetailsResponse>
implements DocumentDetailsPagination {
    
    columns: b2bDocuments.ColumnConfig[];
    headerResource: string;
    pagination: Pagination;

    constructor(
        configService: ConfigService, 
        private menuService: MenuService,
        printHandlerService: PrintHandlerService,
        private erpService: ERPService
    ) {
        super(configService, printHandlerService);

        this.headerResource = 'deliveryDetails';
        this.pagination = new Pagination();

        this.columns = [
            { property: 'position', translation: 'ordinalNumber' },
            { property: 'name', translation: 'codeName', type: 'productName' },
            { property: 'quantity', translation: 'orderedQuantity', type: 'quantity' },
            {
                translation: 'purchaseDocument', type: 'linkedDocument', link: {
                    labelProperty: 'sourceDocumentName',
                    hrefCreator: this.hrefCreator.bind(this)
                }
            }
        ];

    }

    protected requestDetails(id = this.id) {
        const paginationParams = this.pagination.getRequestParams();
        return this.erpService.context.delivery.details(id, paginationParams.pageNumber);
    }

    loadDetails(id = this.id) {

        const propertyNames: b2bDocuments.PropertyNames = {
            headerProperty: 'deliveryHeader',
            attachmentsProperty: 'deliveryAttachments'
        };

        return super.loadDetailsBase(id, propertyNames).pipe(tap(res => {

            this.items = res.deliveryItems.map(item => {
                this.fillProductImageIfPossible(item, item.image.imageId, item.image.imageUrl, item.image.imageType);
                return item;
            });

            this.header.copyToCartDisabled = true;
            this.header.isPrintingDisabled = true;

            this.pagination.changeParams(res.pagingResponse);

        }));
    }

    hrefCreator(item: b2bDelivery.DeliveryItem) {
        switch (item.sourceDocumentType) {
            case SourceDocumentNumberType.ZS:
                return `${this.menuService.routePaths.orderDetails}/${item.sourceDocumentId}`;
            case SourceDocumentNumberType.FS:
            case SourceDocumentNumberType.PA:
                return `${this.menuService.routePaths.paymentDetails}/${item.sourceDocumentId}/${item.sourceDocumentType}`;
            default:
                return null;
        }
    }

    print(): Observable<void> {
        throw new Error('Method not implemented.');
    }

    getItemId(item: b2bDelivery.DeliveryItem): number {
        return item.itemId;
    }
}
