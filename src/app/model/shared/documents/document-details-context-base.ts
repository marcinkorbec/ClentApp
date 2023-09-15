import { Observable } from 'rxjs';
import { b2bShared } from 'src/integration/b2b-shared';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';

export interface DocumentDetailsContextBase<listHeader, listItem, response> {

    id: number;
    header: listHeader;
    items: listItem[];
    attachments: b2bShared.Attachment[]; 
    attributes: b2bShared.Attrubute[];
    columns: b2bDocuments.ColumnConfig[];
    detailsBoxMessages: b2bShared.BoxMessages;
    loadDetails(id: number): Observable<response>;
    print(): Observable<void>;
    clearDetailsBoxMessages(): void;

    /**
     * Different property names in documents.
     * Gets item id from proper property.
     */
    getItemId(el: listItem): number;
}
