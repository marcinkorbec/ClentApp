import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AccountService } from '../../account.service';
import { RouterLinkType } from '../../enums/linkType.enum';
import { MenuService } from '../../menu.service';
import { BasicListContext } from './basic-list-context';

export abstract class BasicItemsList<listItem extends b2bDocuments.ListItemBase, filteringOptions, listResponse>
    implements Resolve<BasicListContext<listItem, filteringOptions, listResponse>>, BasicListContext<listItem, filteringOptions, listResponse> {

    items: listItem[];
    currentFilter: filteringOptions;
    gridTemplateColumnsDesktop: string;
    gridTemplateColumnsMobile: string;
    abstract emptyListMessage: b2bDocuments.EmptyListInfo;
    columnsMarked: boolean;
    listResponseProperty: string;
    routerLinkType: RouterLinkType;

    /**
     * TODO: refactor columns to setter, include column styles
     */
    abstract columns: b2bDocuments.ColumnConfig[];

    protected constructor(protected httpClient: HttpClient, protected menuService: MenuService, protected accountService: AccountService) {

        this.currentFilter = Object.assign(this.currentFilter || <filteringOptions>{}, this.getDefaultFilteringOptions());
        this.gridTemplateColumnsMobile = '1fr 1fr';
        this.listResponseProperty = '0';
        this.routerLinkType = RouterLinkType.href;
        this.cleaningEvent();

    }

    protected abstract getDefaultFilteringOptions(): filteringOptions;

    protected abstract requestList(): Observable<listResponse>;

    abstract getDocumentRouterLink(item: listItem): string | string[];

    /**
     * Method of Resolve interfase.
     * Method provides service to specific route using router resolver.
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): BasicListContext<listItem, filteringOptions, listResponse> {
        return this;
    }

    loadList(): Observable<listResponse> {

        return this.requestList().pipe(tap(
            res => {

                this.markDefaultMobileVisibleColumns();
                this.items = res[this.listResponseProperty];
                this.gridTemplateColumnsDesktop = `repeat(${this.columns.length}, 1fr)`;

                return res;
            }
        ));
    }


    setCurrentFilter(filterParam: filteringOptions) {
        this.currentFilter = Object.assign(this.currentFilter, filterParam);
    }

    isAnyFilterChanged(): boolean {
        const defaultFilters = this.getDefaultFilteringOptions();

        for (const i in this.currentFilter) {

            if (this.currentFilter[i] !== defaultFilters[i]) {
                return true;
            }
        }

        return false;
    }

    resetAllFilters() {
        this.currentFilter = this.getDefaultFilteringOptions();
        return this.loadList();
    }

    cleaningEvent() {
        this.accountService.logOutSubj.subscribe(() => {
            this.currentFilter = this.getDefaultFilteringOptions();
            this.items = undefined;
        });
    }

    markDefaultMobileVisibleColumns() {

        if (this.columnsMarked || this.columns.filter(col => col.mobileVisibleColumn).length !== 0) {
            return;
        }

        this.columns.forEach(col => {

            if (col.property && (
                col.property === 'number'
                || col.property === 'issueDate'
                || col.property === 'name')) {

                col.mobileVisibleColumn = true;
            }


        });

        this.columnsMarked = true;


    }


}
