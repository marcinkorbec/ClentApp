import { Observable } from 'rxjs';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { ListContext } from './list-context';

export interface DocumentListContext<listItem, filteringOptions, listItemResponse> extends ListContext<listItem, filteringOptions, listItemResponse> {
    loadStates(): Observable<b2bDocuments.StateResource[]>;
}
