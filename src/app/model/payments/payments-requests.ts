import { Observable } from 'rxjs';
import { b2bPayments } from 'src/integration/b2b-payments';
import { b2bCommon } from 'src/integration/shared/b2b-common';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { PaymentType } from './payment-type.enum';

export interface PaymentsRequests {

    list(params: b2bPayments.ListRequest): Observable<b2bPayments.ListResponse>;

    filterStates(): Observable<b2bDocuments.StateResource[]>;

    currencies(): Observable<b2bCommon.Option[]>;

    details(id: number, type: PaymentType): Observable<b2bPayments.Details>;
}
