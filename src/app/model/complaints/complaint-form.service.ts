import { Injectable } from '@angular/core';
import { b2bShared } from 'src/integration/b2b-shared';
import { ComplaintsService } from './complaints.service';
import { ImageType } from '../shared/enums/image-type.enum';
import { ERPService } from '../shared/erp/erp.service';
import { tap } from 'rxjs/operators';
import { b2bComplaints } from 'src/integration/b2b-complaints';
import { b2bCommon } from 'src/integration/shared/b2b-common';
import { CacheService } from '../cache.service';
import { AccountService } from '../account.service';

@Injectable()
export class ComplaintFormService {

    itemId: number;
    sourceDocumentNumber: number;
    no: number;
    config: b2bComplaints.ComplaintFormSummary;
    item: b2bComplaints.ComplaintFormItem;
    requests: b2bCommon.Option;
    maxQuantity: number;


    constructor(
        private complaintsService: ComplaintsService,
        private erpService: ERPService,
        private cacheService: CacheService,
        private accountService: AccountService
    ) { 
        this.accountService.logOutSubj.subscribe(() => {
            this.itemId = undefined;
            this.sourceDocumentNumber = undefined;
            this.no = undefined;
            this.config = undefined;
            this.item = undefined;
            this.requests = undefined;
            this.maxQuantity = undefined;
        });
    }

    private requestProducts(itemId, sourceDocumentNumber, no) {
        return this.erpService.context.complaints.formDetails(itemId, sourceDocumentNumber, no);
    }

    loadProducts(itemId, sourceDocumentNumber, no) {

        return this.requestProducts(itemId, sourceDocumentNumber, no).pipe(tap(res => {

            this.itemId = itemId;
            this.sourceDocumentNumber = sourceDocumentNumber;
            this.no = no;
            this.config = res.complaintFormSummary;
            this.item = res.complaintFormItems[0];
            this.maxQuantity = this.item.basicQuantity;

            this.item.image = this.prepareImageBase(this.item.image.imageId, this.item.image.imageUrl, this.item.image.imageType) as b2bShared.CommonImage;
            this.item.image.imageHeight = 250;
            this.item.image.imageWidth = 400;

            return res;
        }));
    }

    loadRequests() {

        return this.erpService.context.complaints.requests().pipe(tap(res => {
            this.requests = res;
            return res;
        }));
    }


    complain(complainData: b2bComplaints.ComplainParameters) {

        return this.erpService.context.complaints.complaint(complainData).pipe(tap(res => {
            this.complaintsService.items = undefined;
            this.cacheService.clearCache('/api/complaints');
            return res;
        }));
    }

    private prepareImageBase(imageId: number, imageUrl: string, imageType: ImageType): b2bShared.ImageBase {
        return { imageId, imageUrl, imageType };
    }
}
