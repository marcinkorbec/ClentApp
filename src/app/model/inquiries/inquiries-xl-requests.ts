import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { b2bInquiries } from 'src/integration/b2b-inquiries';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { XlInquiryStatus } from '../enums/xl-inquiry-status.enum';
import { InquiriesRequests } from './inquiries-requests';

export class InquiriesXlRequests implements InquiriesRequests {


    constructor(private httpClient: HttpClient) { }


    list(params: b2bInquiries.ListRequest): Observable<b2bInquiries.ListResponse> {
        return this.httpClient.get<b2bInquiries.ListResponse>('/api/inquiries/listXl', { params: <any>params });
    }

    filterStates(): Observable<b2bDocuments.StateResource[]> {
        return this.httpClient.get<b2bDocuments.StateResource[]>('/api/inquiries/filterStates');
    }

    getColumnsConfig(): b2bDocuments.ColumnConfig[] {
        return [{ property: 'description', translation: 'inquiryContent', type: 'html' }];
    }

    details(id: number): Observable<b2bInquiries.DetailsResponseUnified> {

        return this.httpClient.get<b2bInquiries.DetailsResponseXL>('/api/inquiries/detailsXl/' + id).pipe(
            map(res => {

                const permissionsAndBehaviour = {
                    permissionsAndBehaviour: {
                        copyToCartDisabled: true,
                        canRemove: res.inquiryHeader.state === XlInquiryStatus.unconfirmed,
                        showDetails: (res.attributes && res.attributes.length > 0) ? true : false
                    }
                };

                const items = {
                    inquiryItems: [
                        {
                            description: res.inquiryHeader.description,
                            extensions: {
                                extendedItemsList: res.inquiryHeader.extensions.extendedItemsList
                            }
                        }
                    ]
                };

                const newResponse = Object.assign(res, items, permissionsAndBehaviour);

                newResponse.inquiryHeader.description = null;

                return newResponse;
            })
        );
    }


    remove(id: number): Observable<boolean> {
        return this.httpClient.delete<boolean>('/api/inquiries/remove/' + id);
    }
}
