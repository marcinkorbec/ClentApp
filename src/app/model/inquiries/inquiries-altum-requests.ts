import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { b2bInquiries } from 'src/integration/b2b-inquiries';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AltumDocumentStatus } from '../enums/altum-document-status.enum';
import { InquiriesRequests } from './inquiries-requests';

export class InquiriesAltumRequests implements InquiriesRequests {


    constructor(private httpClient: HttpClient) {}
    

    list(params: b2bInquiries.ListRequest): Observable<b2bInquiries.ListResponse> {
       return this.httpClient.get<b2bInquiries.ListResponse>('/api/inquiries/listAltum', {params: <any>params});
    }

    filterStates(): Observable<b2bDocuments.StateResource[]> {
        return this.httpClient.get<b2bDocuments.StateResource[]>('/api/inquiries/filterStates');
    }

    getColumnsConfig(): b2bDocuments.ColumnConfig[] {
        return [
            { property: 'position', translation: 'ordinalNumber' },
            { property: 'name', translation: 'codeName', type: 'productNameWithoutPhoto' },
            { property: 'quantity', type: 'quantity' }
        ];
    }

    details(id: number): Observable<b2bInquiries.DetailsResponseUnified> {
        return this.httpClient.get<b2bInquiries.DetailsResponseAltum>('/api/inquiries/detailsAltum/' + id).pipe(map(res => {

            const permissionsAndBehaviour = {
                permissionsAndBehaviour: {
                    copyToCartDisabled: true,
                    canRemove: res.inquiryHeader.state === AltumDocumentStatus.unconfirmed,
                    showDetails: res.inquiryHeader.description || res.inquiryHeader.sourceNumber || (res.attributes && res.attributes.length > 0) ? true : false
                }
            };

            return Object.assign(res, permissionsAndBehaviour);
        }));
    }

    remove(id: number): Observable<boolean> {
       return this.httpClient.delete<boolean>('/api/inquiries/remove/' + id);
    }

}
