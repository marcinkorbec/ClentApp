import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, ViewChildren, QueryList, HostBinding } from '@angular/core';
import { b2b } from 'src/b2b';
import { ResourcesService } from 'src/app/model/resources.service';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from 'src/app/model/config.service';
import { MenuService } from 'src/app/model/menu.service';
import { DateHelper } from 'src/app/helpers/date-helper';
import { catchError, debounceTime, tap } from 'rxjs/operators';
import { DocumentListContext } from 'src/app/model/shared/documents/document-list-context';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { PaymentType } from 'src/app/model/payments/payment-type.enum';
import { PendingService } from 'src/app/model/pending/pending.service';
import { RouterLinkType } from 'src/app/model/enums/linkType.enum';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { OrdersService } from 'src/app/model/orders/orders.service';

type Context = DocumentListContext<any, any, any> & { loadedDocumentsDateRange: Date };

@Component({
    selector: 'app-documents-list',
    templateUrl: './documents-list.component.html',
    styleUrls: ['./documents-list.component.scss'],
    host: { 'class': 'app-documents-list view-with-sidebar' },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsListComponent implements OnInit, OnDestroy {

    PaymentType = PaymentType;
    RouterLinkType = RouterLinkType;

    @HostBinding('class.view-with-sidebar')
    isSidebar: boolean;

    listContext: Context;
    message: string;

    currentMenuItem: b2b.MenuItem;
    backMenuItem: b2b.MenuItem;

    r: ResourcesService;

    @ViewChild('dateFrom')
    dateFromInput: ElementRef<HTMLInputElement>;

    @ViewChild('dateTo')
    dateToInput: ElementRef<HTMLInputElement>;

    private filtersSubject: Subject<Partial<b2bDocuments.SharedFilteringOptions>>;

    emptyListMessage: b2bDocuments.EmptyListInfo;
    url: string;

    gridTemplateColumns: string;
    @ViewChildren('gridRow') gridRows: QueryList<ElementRef<HTMLDivElement>>;

    constructor(
        private activatedRoute: ActivatedRoute,
        public configService: ConfigService,
        resourcesService: ResourcesService,
        public menuService: MenuService,
        public changeDetector: ChangeDetectorRef,
        private router: Router
    ) {
        this.r = resourcesService;
        this.filtersSubject = new Subject<Partial<b2bDocuments.SharedFilteringOptions>>();
    }

    ngOnInit() {

        this.activatedRoute.data.subscribe(res => {

            if (res.listContext instanceof OrdersService && !this.configService.permissions.hasAccessToOrdersList) {
                this.router.navigate([this.menuService.profileSidebar[0].url], {replaceUrl: true});
                return;
            }

            this.listContext = res.listContext;

            this.emptyListMessage = this.listContext.emptyListMessage;

            this.isSidebar = !(this.listContext instanceof PendingService);

            if (this.listContext === undefined) {
                this.handleLackOfPermissions();
                return;
            }

            this.menuService.loadFullMenuItems().then(() => {

                if (this.router.url === this.menuService.routePaths.complaintItems) {

                    this.currentMenuItem = Object.assign(
                        {},
                        this.menuService.fullMenuItems.find(item => item.url === this.menuService.routePaths.complaints)
                    );

                    this.currentMenuItem.resourceKey = 'purchaseDocumentByRange';

                } else {

                    //this.currentMenuItem = Object.assign({}, this.menuService.fullMenuItems.find(item => item.url.includes(this.url)));

                    this.currentMenuItem = this.menuService.fullMenuItems.find(item => item.url.includes(this.router.url));
                }

                this.backMenuItem = this.menuService.defaultBackItem;
            });
            this.url = this.activatedRoute.pathFromRoot.map(el => el.routeConfig ? el.routeConfig.path.split('/')[0] : '').join('/');

            if (this.listContext.pagination) {
                if (!this.isLastRouteRelated()) {
                    this.listContext.pagination.goToStart();
                }
            }

            this.configService.mobileViewport.addListener(<any>this.handleColumnsMediaQuery.bind(this));

            this.loadList();

        });

        //watching filter changes and debounce timing for changes
        this.filtersSubject.pipe(debounceTime(1000)).subscribe((res) => {

            this.listContext.setCurrentFilter(res);
            this.loadList();

        });
    }

    private isLastRouteRelated() {
        if (!this.menuService.lastTwoRoutes) {
            return false;
        }

        return this.isLastRoute(this.url);
    }

    private isLastRoute(path: string) {
        return this.menuService.lastTwoRoutes[0].url.includes(path);
    }


    handleLackOfPermissions() {
        if (this.configService.permissions.hasAccessToOrdersList) {
            this.router.navigate([this.menuService.routePaths.orders]);
        } else {
            this.router.navigate([this.menuService.profileSidebar[0].url]);
        }
    }

    loadList() {
        this.handleLoadingOperation(this.listContext.loadList());
    }

    /*
     * @param promise deprecated
     */
    handleLoadingOperation<operationReturn>(observable: Observable<operationReturn>) {

        this.configService.loaderSubj.next(true);

        observable.pipe(catchError(err => {
            this.handleErrors(err);
            this.configService.loaderSubj.next(false);
            this.changeDetector.markForCheck();
            return err;
        }))
        .subscribe(() => {
            this.handleColumnsMediaQuery(this.configService.mobileViewport);
            this.configService.loaderSubj.next(false);
            this.changeDetector.markForCheck();
        });
    }

    handleErrors(err: any) {

        this.configService.loaderSubj.next(false);

        if (!this.configService.isOnline && this.listContext.items === undefined) {
            this.message = this.r.translations.noDataInOfflineMode;
        }

        if (err.status === 403 || err.status === 405) {
            this.emptyListMessage = this.listContext.emptyListMessage;
            this.emptyListMessage.resx = 'forbidden';
        }

    }

    /**
     * Fixing wrong validation of native date controls. They doesn't respect min, max and required values for direct input.
     * Validators respected only for setting data via datapicker.
     */
    updateDateWithGuardian(value, dateInputType: 'dateFrom' | 'dateTo'): boolean {

        if (!DateHelper.isValid(value)) {

            if (dateInputType === 'dateFrom') {
                this.dateFromInput.nativeElement.value = DateHelper.dateToString(this.listContext.currentFilter.dateFrom);
                return false;
            }

            if (dateInputType === 'dateTo') {
                this.dateToInput.nativeElement.value = DateHelper.dateToString(this.listContext.currentFilter.dateTo);
                return false;
            }

            return false;
        }


        if (dateInputType === 'dateFrom') {
            this.listContext.currentFilter.dateFrom = new Date(value);
            this.filtersSubject.next({ dateFrom: this.listContext.currentFilter.dateFrom });
            return true;
        }

        if (dateInputType === 'dateTo') {
            this.listContext.currentFilter.dateTo = new Date(value);
            this.filtersSubject.next({ dateTo: this.listContext.currentFilter.dateTo });
            return true;
        }

        return true;

    }

    trackByFn(i, el) {
        return el.id || i;
    }

    updateFilter(name, value) {
        const param = {};
        param[name] = value;

        this.filtersSubject.next(param);
    }


    lazyLoadFilterValues(requestObservable?: Function) {
        if (requestObservable) {
            requestObservable().subscribe(() => {
                this.changeDetector.markForCheck();
            });
        }
    }

    resetAllFilters() {

        const operation = this.listContext.resetAllFilters().pipe(
            tap((res) => {
                if (this.listContext.pagination) {
                    this.listContext.pagination.goToStart();
                }
                return res;
            }
        ));

        this.handleLoadingOperation(operation);
    }


    changePage(page: number) {
        this.listContext.pagination.changePage(page);
        this.loadList();
    }

    loadStates() {
        this.listContext.loadStates().subscribe(() => {
            this.changeDetector.markForCheck();
        });
    }

    handleColumnsMediaQuery(mediaQueryList: MediaQueryList) {

        if (mediaQueryList.matches) {
            this.gridTemplateColumns = this.listContext.gridTemplateColumnsMobile;
            this.gridRows.forEach(row => {
                row.nativeElement.style.gridTemplateColumns = this.listContext.gridTemplateColumnsMobile;
            });
            this.changeDetector.markForCheck();
        } else {
            this.gridTemplateColumns = this.listContext.gridTemplateColumnsDesktop;
            this.gridRows.forEach(row => {
                row.nativeElement.style.gridTemplateColumns = this.listContext.gridTemplateColumnsDesktop;
            });
            this.changeDetector.markForCheck();
        }
    }

    isColumnVisible(col: b2bDocuments.ColumnConfig) {

        if ('mobileHiddenHeader' in col) {
            return !this.configService.isMobile || (col.mobileVisibleColumn && !col.mobileHiddenHeader);
        }

        return !this.configService.isMobile || col.mobileVisibleColumn;
    }

    removeUnderscorePrefix(str: string) {
        return ConvertingUtils.removeUnderscorePrefix(str);
    }

    getTranslationsKey(str: string) {
        return ConvertingUtils.lowercaseFirstLetter(ConvertingUtils.removeUnderscorePrefix(str));
    }

    ngOnDestroy(): void {
        this.filtersSubject.complete();
        this.configService.mobileViewport.removeListener(() => { });
    }
}
