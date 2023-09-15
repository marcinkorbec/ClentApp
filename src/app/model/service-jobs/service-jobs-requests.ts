import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { b2bServiceJobs } from 'src/integration/b2b-service-jobs';
import { b2bCommon } from 'src/integration/shared/b2b-common';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export class ServiceJobsRequests {

    constructor(private httpClient: HttpClient) {}

    list(params: b2bServiceJobs.ListRequest): Observable<b2bServiceJobs.ListResponseUnified> {
       return this.httpClient.get<b2bServiceJobs.ListResponse>('/api/serviceJob/get', {params: <any>params}).pipe(map(res => {
           
            res.serviceJobs.forEach(el => {
                
                if (Object.keys(el.extensions.extendedItemsList).length) {
                    delete el.objectExtension;
                    return;
                }
                
                el.extensions.extendedItemsList = ConvertingUtils.convertOldApiExtensionsToNew(el.objectExtension.extendedItemsList);
                delete el.objectExtension;
            });
            return res;
       }));
    }

    filterStates(): Observable<b2bDocuments.StateResource[]> {
        return this.httpClient.get<b2bDocuments.StateResource[]>('/api/serviceJob/filterStates');
    }

    filterStatuses(): Observable<b2bCommon.Option2[]> {
        return this.httpClient.get<b2bCommon.Option2[]>('/api/serviceJob/filterStates');
    }

    details(serviceJobId: number): Observable<b2bServiceJobs.DetailsUnified> {

        return this.httpClient.get<b2bServiceJobs.DetailsResponse>('/api/serviceJob/get/' + serviceJobId).pipe(map(res => {

            const newHeader: any = res;

            const attachments = newHeader.attachments;
            const attributes = newHeader.attributes;
            const images = newHeader.images;
            const items = newHeader.devices;

            delete newHeader.attachments;
            delete newHeader.attributes;
            delete newHeader.images;
            delete newHeader.devices;

            newHeader.number = newHeader.documentNumber;
            delete newHeader.documentNumber;

            newHeader.sourceNumber = newHeader.myDocumentNumber;
            delete newHeader.myDocumentNumber;

            return Object.assign({
                serviceJobHeader: newHeader as b2bServiceJobs.ServiceJobHeader,
                serviceJobItems: items,
                attributes: attributes,
                images: images,
                serviceJobAttachments: attachments
            });
        }));
    }

    deviceActions(deviceId: number, serviceJobId: number): Observable<b2bServiceJobs.DeviceActionResponse[]> {
        return this.httpClient.get<b2bServiceJobs.DeviceActionResponse[]>(`/api/serviceJob/deviceActions/${serviceJobId}/${deviceId}`);
    }

    deviceActionDetails(actionId: number, deviceId: number, serviceJobId: number): Observable<b2bServiceJobs.DeviceActionDetails> {
        return this.httpClient.get<b2bServiceJobs.DeviceActionDetails>(`/api/serviceJob/deviceActions/${serviceJobId}/${deviceId}/${actionId}`);
    }

    payments(serviceJobId: number): Observable<b2bServiceJobs.Payment[]> {
        return this.httpClient.get<b2bServiceJobs.Payment[]>('/api/serviceJob/payments/' + serviceJobId);
    }

}

