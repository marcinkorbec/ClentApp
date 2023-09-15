import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { DocumentDetailsContextBase } from './document-details-context-base';

export interface DocumentDetailsContext<listHeader, listItem, response> extends DocumentDetailsContextBase<listHeader, listItem, response> {
    summaries: b2bDocuments.DetailsSummary[];
}
