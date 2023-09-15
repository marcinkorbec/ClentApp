import { Subscription, combineLatest, of } from 'rxjs';
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesService } from '../../model/resources.service';
import { b2b } from '../../../b2b';
import { MenuService } from '../../model/menu.service';
import { ConfigService } from '../../model/config.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModalService } from 'src/app/model/shared/common-modal.service';
import { BoxMessageType } from '../../model/shared/enums/box-message-type.enum';
import { CommonAvailableCartsService } from '../../model/shared/common-available-carts.service';
import { b2bShared } from 'src/integration/b2b-shared';
import { OrderDetailsService } from 'src/app/model/orders/order-details.service';
import { QuoteDetailsService } from 'src/app/model/quotes/quote-details.service';
import { PaymentDetailsService } from 'src/app/model/payments/payment-details.service';
import { DocumentDetailsContext } from 'src/app/model/shared/documents/document-details-context';
import { DocumentDetailsCart } from 'src/app/model/shared/documents/document-details-cart';
import { DocumentDetailsRemove } from 'src/app/model/shared/documents/document-details-remove';
import { DocumentDetailsConfirm } from 'src/app/model/shared/documents/document-details-confirm';
import { DocumentDetailsPagination } from 'src/app/model/shared/documents/document-details-pagination';
import { DocumentDetailsWithType } from 'src/app/model/shared/documents/document-details-with-type';
import { catchError, tap } from 'rxjs/operators';
import { DocumentDetailsRelatedDocuments } from 'src/app/model/shared/documents/document-details-related-documents';
import { CreditLimitBehaviourEnum } from 'src/app/model/shared/enums/credit-limit-behaviour.enum';
import { BoxMessageClass } from 'src/app/model/shared/enums/box-message-class.enum';
import { DocumentDetailsHeaderHeleper } from './document-details-header-helper';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';

type context<header, item, res> = DocumentDetailsContext<header, item, res>
    & DocumentDetailsCart
    & DocumentDetailsConfirm
    & DocumentDetailsRemove
    & DocumentDetailsPagination
    & DocumentDetailsWithType<res>
    & DocumentDetailsRelatedDocuments
    & {isPossibleToMakeAnOffer: boolean, permissionsAndBehaviour: any};

@Component({
    selector: 'app-new-document-details',
    templateUrl: './document-details.component.html',
    styleUrls: ['./document-details.component.scss'],
    host: { class: 'app-document-details' },
    encapsulation: ViewEncapsulation.None
})
export class DocumentDetailsComponent implements OnInit, OnDestroy {

    CreditLimitBehaviourEnum = CreditLimitBehaviourEnum;
    BoxMessageClass = BoxMessageClass;

    url: string;
    id: number;
    detailsContext: context<any, any, any>;
    r: ResourcesService;
    type?: number;
    backMenuItem: b2b.MenuItem;

    private activatedRouteSubscription: Subscription;

    detailsVisibility: boolean;
    confirmModalVisibility: boolean;

    remove: Function;
    confirm: Function;
    message: string;
    error: string;

    changePage: Function;

    detailsConfig: b2b.CustomerConfig & b2b.Permissions & { fromQuote?: number } & b2bShared.ProductTableConfig;

    private availableCartsSub: Subscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        public configService: ConfigService,
        resourcesService: ResourcesService,
        private menuService: MenuService,
        private router: Router,
        private commonModalService: CommonModalService,
        private commonAvailableCartsService: CommonAvailableCartsService
    ) {
        this.r = resourcesService;
    }

    ngOnInit() {
        this.activatedRouteSubscription = combineLatest([this.activatedRoute.params, this.activatedRoute.data]).subscribe(res => {
            const routeParams = res[0];
            this.configService.loaderSubj.next(true);
            this.id = Number(routeParams.id || 0);
            this.type = Number(routeParams.type);
            this.url = this.activatedRoute.pathFromRoot.map(el => el.routeConfig ? el.routeConfig.path.split('/')[0] : '').join('/');
            this.message = null;


            this.detailsContext = res[1].detailsContext;

            if (this.detailsContext.remove) {
                this.implementRemoveMethod();
            }

            if (this.detailsContext.confirm) {
                this.implementConfirmMethod();
            }

            if (this.detailsContext.pagination) {
                this.implementPagination();
            }

            this.prepareMenuItems();

            this.loadDetails(this.id, this.type).subscribe(() => {
                this.configService.loaderSubj.next(false);
            });

            this.availableCartsSub = this.commonAvailableCartsService.availableCartsStatusChanged.subscribe(res => {
                if (res.isPermissionToCreateNewCart) {
                    if (this.detailsContext.detailsBoxMessages && this.detailsContext.detailsBoxMessages.messages.includes(BoxMessageType.MaxNumberOfCartsReached)) {
                        this.detailsContext.detailsBoxMessages = undefined;
                    }
                }
            });
        });

    }

    changeVisibility(section: 'details' | 'confirmModal', isVisible?: boolean) {

        if (section === 'details') {
            this.detailsVisibility = (isVisible === undefined) ? !this.detailsVisibility : isVisible;

        } else if (section === 'confirmModal') {
            this.confirmModalVisibility = (isVisible === undefined) ? !this.confirmModalVisibility : isVisible;
        }

    }

    loadDetails(id = this.id, type = this.type) {

        return this.detailsContext.loadDetails(id, type).pipe(
            tap(() => {

                this.detailsConfig = Object.assign({}, this.configService.config, this.configService.permissions);

                if (this.detailsContext instanceof QuoteDetailsService) {
                    this.detailsConfig.fromQuote = this.id;
                }

                if (this.detailsContext instanceof OrderDetailsService) {
                    this.detailsConfig.haveProductsDescription = true;
                }

                if (this.detailsContext instanceof PaymentDetailsService) {
                    this.detailsConfig.haveBottomButton = true;
                }

                this.configService.loaderSubj.next(false);

                if (this.detailsContext.items.length === 0) {
                    //no products received when user has no permission to the document
                    this.router.navigate([this.menuService.routePaths.home]);
                    return;
                }

            }),
            catchError((err: HttpErrorResponse) => {
                this.handleLoadingErrors(err);
                this.configService.loaderSubj.next(false);
                return of(err);
            })
        );
    }


    copyToCart(cartId: number) {
        if (!cartId) {
            this.commonModalService.showNoAvailableCartsModalMessage();
            return;
        }
        this.error = null;
        this.configService.loaderSubj.next(true);

        this.detailsContext.copyToCart(cartId).pipe(
            catchError(err => {
                if (err.status === 403) {
                    this.error = this.r.translations.forbiddenProductsWhileCopying;
                }
    
                this.configService.loaderSubj.next(false);
                return of(err);
            })
        ).subscribe(() => {
            this.configService.loaderSubj.next(false);
        });
    }

    showErrorMessage(errorMessage: string) {
        this.error = errorMessage;
    }


    implementConfirmMethod() {
        this.confirm = () => {
            this.configService.loaderSubj.next(true);
            this.detailsContext.confirm().subscribe(() => {
                this.loadDetails(this.id, this.type).subscribe(() => {
                    this.configService.loaderSubj.next(false);
                });
            });
        };
    }

    implementRemoveMethod() {
        this.remove = () => {
            this.configService.loaderSubj.next(true);
            this.detailsContext.remove().subscribe();
        };
    }

    implementPagination() {
        this.changePage = (currentPage) => {
            this.configService.loaderSubj.next(true);
            this.detailsContext.pagination.changePage(currentPage);
            this.loadDetails(this.id, this.type).subscribe(() => {
                this.configService.loaderSubj.next(false);
            });
        };
    }

    handleLoadingErrors(err: HttpErrorResponse) {

        if (!this.configService.isOnline && this.id !== this.detailsContext.id) {
            //offline and old data
            this.detailsContext = <any>{};
            this.error = this.r.translations.noDataInOfflineMode;

        }

        if (err.status === 405 || err.status === 403) {
            this.error = this.r.translations.forbidden;
        }

        if (err.status === 404) {
            this.error = this.r.translations.documentNotFound;
        }
    }

    prepareMenuItems() {
        this.menuService.loadFullMenuItems().then(() => {
            this.backMenuItem = Object.assign({}, this.menuService.fullMenuItems.find(item => this.url.includes(item.url)));
            this.backMenuItem = this.menuService.convertLabelToBack(this.backMenuItem, 'back');
        });
    }

    filterHeaderPropertiesForLoop() {
        const filteredObject = {};

        for (const key in this.detailsContext.header) {
            
            if (this.detailsContext.header[key] && !DocumentDetailsHeaderHeleper.propertiesToRemove.has(key) || key === 'completionEntirely') {
                filteredObject[key] = this.detailsContext.header[key];
            }

        }

        return filteredObject;
    }

    getLabelTranslation(property: string) {
        const removedUnderscore = ConvertingUtils.removeUnderscorePrefix(property);
        const lowerCaseProperty = ConvertingUtils.lowercaseFirstLetter(removedUnderscore);
        return this.r.translations[DocumentDetailsHeaderHeleper.propertyTranslation.get(lowerCaseProperty)] || this.r.translations[lowerCaseProperty] || property;
    }

    removeUnderscorePrefix(str: string) {
        return ConvertingUtils.removeUnderscorePrefix(str);
    }
    

    ngOnDestroy(): void {
        this.availableCartsSub.unsubscribe();
        this.detailsContext.clearDetailsBoxMessages();
        this.activatedRouteSubscription.unsubscribe();
    }
}
