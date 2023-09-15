import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../../account.service';
import { MenuService } from '../../menu.service';
import { DocumentListContext } from './document-list-context';

import { ItemsList } from './items-list';

/**
 * Base object for new documents lists (after swagger and refactoring api)
 * */
export abstract class DocumentsList
    <documentListItem extends b2bDocuments.ListItemBase, documentFilteringOptions extends b2bDocuments.SharedDocumentFilteringOptions, documentResponse extends b2bDocuments.NewListResponse<b2bDocuments.ListItemBase, string>> 
    extends ItemsList<documentListItem, documentFilteringOptions, documentResponse>
    implements DocumentListContext<documentListItem, documentFilteringOptions, documentResponse>  {

    states: b2bDocuments.StateResource[];
    defaultState: number;

    protected constructor(httpClient: HttpClient, menuService: MenuService, accountService: AccountService) {
        super(httpClient, menuService, accountService);
        this.defaultState = -1;
        this.currentFilter = Object.assign(this.currentFilter || <documentFilteringOptions>{}, this.getDefaultFilteringOptions());
    }

    protected abstract requestFilteringStates(): Observable<b2bDocuments.StateResource[]>;

    loadStates() {
        if (this.states) {
            return of(this.states);
        }

        return this.requestFilteringStates().pipe(tap(res => {
            this.states = res;
        }));
    }

    protected getSharedRequestParams(): b2bDocuments.SharedDocumentRequestParams {

        return Object.assign(
            super.getSharedRequestParams(),
            { stateId: this.currentFilter.stateId }
        );
    }

    protected getSharedDefaultFilteringOptions(): b2bDocuments.SharedDocumentFilteringOptions {

        return Object.assign(
            super.getSharedDefaultFilteringOptions(),
            { stateId: this.defaultState }
        );
    }

}
