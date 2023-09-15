import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { b2bPayments } from 'src/integration/b2b-payments';
import { b2bCommon } from 'src/integration/shared/b2b-common';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { PaymentType } from './payment-type.enum';
import { PaymentsRequests } from './payments-requests';

export class PaymentsAltumRequests implements PaymentsRequests {

    constructor(private httpClient: HttpClient) { }

    list(params: b2bPayments.ListRequest) {
        return this.httpClient.get<b2bPayments.ListResponse>('/api/payments/listAltum', { params: <any>params });
    }

    filterStates() {
        return this.httpClient.get<b2bDocuments.StateResource[]>('/api/payments/filterStates');
    }

    currencies() {
        return this.httpClient.get<b2bCommon.Option[]>('/api/payments/paymentCurrency');
    }

    details(id: number, type: PaymentType): Observable<b2bPayments.Details> {
        return this.httpClient.get<b2bPayments.DetailsResponse>(`/api/payments/DetailsAltum/${id}/${type}`).pipe(map(res => {

            const missingHeaderProperties: b2bPayments.MissingHeaderProperties = {
                paymentForm: res.paymentSummary.paymentForm,
                daysAfterDueDate: res.paymentSummary.daysAfterDueDate,
                dueDate: res.paymentSummary.dueDate
            };

            const newHeader: b2bPayments.PaymentHeaderUI = Object.assign(res.paymentHeader, missingHeaderProperties);

            delete res.paymentSummary.paymentForm;
            delete res.paymentSummary.daysAfterDueDate;
            delete res.paymentSummary.dueDate;

            return Object.assign(res, {paymentHeader: newHeader}, {paymentSummary: [res.paymentSummary]});
        }));
    }

}

