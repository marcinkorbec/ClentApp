import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { b2bComplaints } from 'src/integration/b2b-complaints';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../account.service';
import { ConfigService } from '../config.service';
import { DocumentTypes } from '../enums/document-type.enum';
import { MenuService } from '../menu.service';
import { DocumentDetailsBase } from '../shared/documents/document-details-base';
import { SourceDocumentNumberType } from '../shared/enums/source-document-number-type.enum';
import { ERPService } from '../shared/erp/erp.service';
import { PrintHandlerService } from '../shared/printhandler.service';

@Injectable()
export class ComplaintDetailsService extends DocumentDetailsBase<b2bComplaints.ComplaintHeader, b2bComplaints.ComplaintItem, b2bComplaints.DetailsResponse> {

    columns: b2bDocuments.ColumnConfig[];
    headerResource: string;

    constructor(
        configService: ConfigService, 
        private menuService: MenuService, 
        printHandlerService: PrintHandlerService,
        private erpService: ERPService
    ) {
        super(configService, printHandlerService);

        this.headerResource = 'complaintDetails';

        this.columns = [
            { property: 'position', translation: 'ordinalNumber' },
            { property: 'name', translation: 'codeName', type: 'productName' },
            {
                type: 'linkedDocument',
                translation: 'purchaseDocument',
                link: {
                    hrefCreator: this.hrefCreator.bind(this),
                    labelProperty: 'sourceDocumentName'
                },
            },
            { property: 'quantity', type: 'quantity' },
            { property: 'reason', translation: 'complaintReason' },
            { property: 'request', },
            { property: 'completion', translation: 'state', type: 'complaintHistory' }
        ];


    }

    protected requestDetails(id = this.id) {
        return this.erpService.context.complaints.details(id);
    }


    loadDetails(id = this.id) {

        const propertyNames: b2bDocuments.PropertyNames = {
            headerProperty: 'complaintHeader',
            attachmentsProperty: 'complaintAttachments'
        };

        return super.loadDetailsBase(id, propertyNames).pipe(tap(res => {

            this.items = res.complaintItems.map(item => {
                this.fillProductImageIfPossible(item, item.image.imageId, item.image.imageUrl, item.image.imageType);
                return item;
            });

            this.header.copyToCartDisabled = true;

        }));
    }

    print() {
        return super.printHelper(DocumentTypes.complaint, this.id);
    }

    hrefCreator(item: b2bComplaints.ComplaintItem) {
        switch (item.sourceDocumentType) {
            case SourceDocumentNumberType.FS:
            case SourceDocumentNumberType.PA:
                return `${this.menuService.routePaths.paymentDetails}/${item.sourceDocumentId}/${item.sourceDocumentType}`;
            default:
                return null;
        }
    }

    getItemId(item: b2bComplaints.ComplaintItem): number {
        return item.itemId;
    }
}
