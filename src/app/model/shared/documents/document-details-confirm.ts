import { Observable } from 'rxjs';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export interface DocumentDetailsConfirm {

    id: number;
    confirm(): Observable<b2bDocuments.ConfirmDocumentResponse>;
}
