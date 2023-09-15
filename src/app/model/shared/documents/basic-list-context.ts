import { Observable } from 'rxjs';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { RouterLinkType } from '../../enums/linkType.enum';

export interface BasicListContext<listItem, filteringOptions, listResponse> {

    items: listItem[];
    columns: b2bDocuments.ColumnConfig[];
    currentFilter: filteringOptions;
    gridTemplateColumnsDesktop: string;
    gridTemplateColumnsMobile: string;
    emptyListMessage: b2bDocuments.EmptyListInfo;
    listResponseProperty: string;
    routerLinkType: RouterLinkType;
    loadList(): Observable<listResponse>;
    resetAllFilters(): Observable<listResponse>;
    setCurrentFilter(params: filteringOptions): void;
    isAnyFilterChanged(): void;
    getDocumentRouterLink(item: listItem): string | string[];
}
