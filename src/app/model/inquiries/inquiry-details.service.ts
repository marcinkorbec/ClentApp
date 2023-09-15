import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { b2bInquiries } from 'src/integration/b2b-inquiries';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { CacheService } from '../cache.service';
import { ConfigService } from '../config.service';
import { DocumentTypes } from '../enums/document-type.enum';
import { MenuService } from '../menu.service';
import { DocumentDetailsBase } from '../shared/documents/document-details-base';
import { DocumentDetailsRemove } from '../shared/documents/document-details-remove';
import { ERPService } from '../shared/erp/erp.service';
import { PrintHandlerService } from '../shared/printhandler.service';
import { InquiriesService } from './inquiries.service';

type item = b2bInquiries.InquiryItemXL | b2bInquiries.InquiryItemAltum;

@Injectable()
export class InquiryDetailsService extends DocumentDetailsBase<b2bInquiries.InquiryHeader, item, b2bInquiries.DetailsResponseUnified>
implements DocumentDetailsRemove {


    columns: b2bDocuments.ColumnConfig[];
    headerResource: string;
    permissionsAndBehaviour: b2bInquiries.PermissionsAndBehaviour;

    constructor(
        configService: ConfigService,
        private router: Router,
        private inquiriesService: InquiriesService,
        private menuService: MenuService,
        private cacheService: CacheService,
        printHandlerService: PrintHandlerService,
        private erpService: ERPService
    ) {
        super(configService, printHandlerService);

        this.columns = this.erpService.context.inquiries.getColumnsConfig();
        this.headerResource = 'inquiryDetails';
    }


    protected requestDetails(id = this.id): Observable<b2bInquiries.DetailsResponseUnified> {
        return this.erpService.context.inquiries.details(id);
    }

    loadDetails(id = this.id): Observable<b2bInquiries.DetailsResponseUnified> {

        const propertyNames: b2bDocuments.PropertyNames = {
            headerProperty: 'inquiryHeader',
            attachmentsProperty: 'inquiryAttachments',
            itemsProperty: 'inquiryItems'
        };

        return super.loadDetailsBase(id, propertyNames).pipe(tap(res => {
            //this.columns = this.erpService.context.inquiries.getColumnsConfig();
            this.permissionsAndBehaviour = res.permissionsAndBehaviour;
            this.header.copyToCartDisabled = true;
            return res;
        }));
    }


    private removeRequest(): Observable<boolean> {
        return this.erpService.context.inquiries.remove(this.id);
    }

    remove(): Observable<boolean> {

        return this.removeRequest().pipe(tap(res => {

            if (!res) { return false; }

            this.inquiriesService.items = undefined;

            return this.cacheService.clearCache('/api/inquiries').then(() => {
                this.router.navigate([this.menuService.routePaths.inquiries]);
                return res;
            });
            
       
        }));
    }

    print() {
        return super.printHelper(DocumentTypes.inquiry, this.id);
    }

    getItemId(item: b2bInquiries.InquiryItemAltum): number {
        return item.id;
    }
}
