import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { b2b } from 'src/b2b';
import { b2bServiceJobs } from 'src/integration/b2b-service-jobs';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { ConfigService } from '../config.service';
import { DocumentTypes } from '../enums/document-type.enum';
import { DocumentDetailsBase } from '../shared/documents/document-details-base';
import { ERPService } from '../shared/erp/erp.service';
import { PrintHandlerService } from '../shared/printhandler.service';

@Injectable()
export class ServiceJobDetailsService extends DocumentDetailsBase<b2bServiceJobs.ServiceJobHeader, b2bServiceJobs.Device, b2bServiceJobs.DetailsUnified> {
    
    headerResource: string;
    payments: b2bServiceJobs.Payment[];
    columns: b2bDocuments.ColumnConfig[];

    constructor(
        configService: ConfigService,
        printHandlerService: PrintHandlerService,
        private erpService: ERPService
    ) {
        super(configService, printHandlerService);

        this.headerResource = 'serviceJobDetails';
    }

    protected requestDetails(id: number) {
        return this.erpService.context.serviceJobs.details(id);
    }


    protected requestDeviceActions(deviceId: number, serviceJobId = this.id) {
        return this.erpService.context.serviceJobs.deviceActions(deviceId, serviceJobId);
    }


    protected requestDeviceActionDetails(actionId: number, deviceId: number, serviceJobId = this.id) {
        return this.erpService.context.serviceJobs.deviceActionDetails(actionId, deviceId, serviceJobId);
    }

    protected requestPayments(serviceJobId = this.id) {
        return this.erpService.context.serviceJobs.payments(serviceJobId);
    }

    loadDetails(serviceJobId: number) {

        this.payments = null;

        const propertyNames: b2bDocuments.PropertyNames = {
            headerProperty: 'serviceJobHeader',
            attachmentsProperty: 'serviceJobAttachments'
        };

        return this.loadDetailsBase(serviceJobId, propertyNames).pipe(tap(res => {
            this.items = res.serviceJobItems.map(item => {
                if (item.type) {
                    item.type = ConvertingUtils.lowercaseFirstLetter(item.type);
                }
                return item;
            });
        }));
    }

    loadDeviceActions(deviceId: number, serviceJobId = this.id) {

        const device = this.items.find(device => deviceId === device.id);

        if ('actions' in device) {
            return of(Object.assign({}, device.actions));
        }

        return this.requestDeviceActions(deviceId, serviceJobId).pipe(tap(res => {
            this.items.find(device => deviceId === device.id).actions = res;
            return res;
        }));
    }


    loadDeviceActionDetails(actionId: number, deviceId: number, serviceJobId = this.id) {

        const device = this.items.find(device => deviceId === device.id);
        const action = device.actions.find(action => actionId === action.id);


        if ('details' in action) {
            return of(Object.assign({}, action.details));
        }

        return this.requestDeviceActionDetails(actionId, deviceId, serviceJobId).pipe(tap(res => {
            action.details = res;
            return res;
        }));
    }


    loadPayments(serviceJobId = this.id) {

        if (this.payments) {
            return of(this.payments);
        }

        return this.requestPayments(serviceJobId).pipe(tap(res => {
            this.payments = res;
            return res;
        }));

    }

    print() {
        return super.printHelper(DocumentTypes.serviceJob, this.id);
    }

    getItemId(item: b2bServiceJobs.Device): number {
        return item.id;
    }
}
