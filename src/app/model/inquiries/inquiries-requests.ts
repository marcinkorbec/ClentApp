import { Observable } from 'rxjs';
import { b2bInquiries } from 'src/integration/b2b-inquiries';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export interface InquiriesRequests {

    list(params: b2bInquiries.ListRequest): Observable<b2bInquiries.ListResponse>;

    filterStates(): Observable<b2bDocuments.StateResource[]>;

    getColumnsConfig(): b2bDocuments.ColumnConfig[];

    details(id: number): Observable<b2bInquiries.DetailsResponseUnified>;

    remove(id: number): Observable<boolean>;

}
