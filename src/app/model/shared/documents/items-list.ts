import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AccountService } from '../../account.service';
import { DateHelper } from 'src/app/helpers/date-helper';
import { MenuService } from '../../menu.service';
import { Pagination } from '../pagination';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ListContext } from './list-context';
import { BasicItemsList } from './basic-items-list';
import { RouterLinkType } from '../../enums/linkType.enum';


/**
 * Base object for new documents and pending lists (after swagger and refactoring api)
 * */
export abstract class ItemsList<listItem extends b2bDocuments.ListItemBase, filteringOptions extends b2bDocuments.SharedFilteringOptions, listResponse extends b2bDocuments.NewListResponse<b2bDocuments.ListItemBase, string>>
    extends BasicItemsList<listItem, filteringOptions, listResponse>
    implements Resolve<ListContext<listItem, filteringOptions, listResponse>>, ListContext<listItem, filteringOptions, listResponse> {

    pagination: Pagination;

    protected constructor(httpClient: HttpClient, menuService: MenuService, accountService: AccountService) {

        super(httpClient, menuService, accountService);

        this.pagination = new Pagination();
        this.currentFilter = Object.assign(this.currentFilter, this.getDefaultFilteringOptions());
        this.routerLinkType = RouterLinkType.routerLink;
    }

    abstract getDocumentRouterLink(item: listItem): string[];

    /**
     * Method of Resolve interfase.
     * Method provides service to specific route using router resolver.
     */
     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): ListContext<listItem, filteringOptions, listResponse> {
        return this;
    }

    protected getSharedRequestParams(): b2bDocuments.SharedRequestParams {

        return {
                dateFrom: DateHelper.dateToString(this.currentFilter.dateFrom),
                dateTo: DateHelper.dateToString(this.currentFilter.dateTo),
                pageNumber: this.pagination.getRequestParams().pageNumber,
                getFilter: true,
                updateFilter: true,
                controlDate: true
        };
    }

    protected getSharedDefaultFilteringOptions(): b2bDocuments.SharedFilteringOptions {

        return {
                dateFrom: <Date>DateHelper.calculateWeeks(new Date(), -2),
                dateTo: new Date()
        };
    }

    loadList(): Observable<listResponse> {

        return super.loadList().pipe(tap(res => {
            this.pagination.changeParams(res.paging);
            return res;
        }));
    }

    setCurrentFilter(filterParam: filteringOptions) {

        if ('dateFrom' in filterParam) {
            filterParam.dateFrom = new Date(filterParam.dateFrom);
        }

        if ('dateTo' in filterParam) {
            filterParam.dateTo = new Date(filterParam.dateTo);
        }

        super.setCurrentFilter(filterParam);
    }

    isAnyFilterChanged(): boolean {
        const defaultFilters = this.getDefaultFilteringOptions();

        for (const i in this.currentFilter) {

            if (this.currentFilter[i] instanceof Date) {
                if (DateHelper.difference(<Date><unknown>this.currentFilter[i], <Date><unknown>defaultFilters[i], 'days') !== 0) {
                    return true;
                }
            } else if (this.currentFilter[i] !== defaultFilters[i]) {
                return true;
            }
        }

        return false;
    }

}
