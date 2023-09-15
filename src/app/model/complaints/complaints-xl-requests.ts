import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { b2bComplaintItems } from 'src/integration/b2b-complaint-items';
import { b2bComplaints } from 'src/integration/b2b-complaints';
import { b2bCommon } from 'src/integration/shared/b2b-common';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export class ComplaintsXlRequests {

    constructor(private httpClient: HttpClient) { }


    list(params: b2bComplaints.ListRequest): Observable<b2bComplaints.ListResponse> {
        return this.httpClient.get<b2bComplaints.ListResponse>('/api/complaints/listXl', { params: <any>params });
    }

    filterStates(): Observable<b2bDocuments.StateResource[]> {
        return this.httpClient.get<b2bDocuments.StateResource[]>('/api/complaints/filterStates');
    }

    complaintItemsList(params: b2bComplaintItems.ListRequest): Observable<b2bComplaintItems.ListResponse> {
        return this.httpClient.get<b2bComplaintItems.ListResponse>('/api/complaints/listOfArticleToComplaintXl', { params: <any>params });
    }

    complaintItemsPurchaseDocuments(params: b2bComplaintItems.PurchaseDocumentsRequestParams) {
        return this.httpClient.get<b2bDocuments.DocumentReference[]>('/api/complaints/purchaseDocuments', { params: <any>params });
    }

    details(id: number): Observable<b2bComplaints.DetailsResponse> {
        return this.httpClient.get<b2bComplaints.DetailsResponse>('/api/complaints/detailsXl/' + id);
    }

    formDetails(itemId: number, sourceDocumentId: number, no: number): Observable<b2bComplaints.FormDetails> {
        return this.httpClient.get<b2bComplaints.FormDetails>(`/api/complaints/complaintFormXl?itemsComplaint=${itemId}:${sourceDocumentId}:${no}`);
    }

    requests(): Observable<b2bCommon.Option> {
        return this.httpClient.get<b2bCommon.Option>('/api/complaints/requests');
    }

    complaint(body: b2bComplaints.ComplainParameters): Observable<b2bComplaints.ComplainResponse> {
        return this.httpClient.put<b2bComplaints.ComplainResponse>('/api/complaints/addComplaint', body);
    }
}
