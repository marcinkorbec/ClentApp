import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ResourcesService } from '../../model/resources.service';
import { ConfigService } from '../../model/config.service';
import { b2b } from '../../../b2b';
import { MenuService } from 'src/app/model/menu.service';
import { CyclicityType } from 'src/app/model/enums/cyclicity-type.enum';
import { FormatPipe } from 'src/app/helpers/pipes/format.pipe';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { PromotionType } from 'src/app/model/enums/promotion-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { b2bShared } from 'src/integration/b2b-shared';
import { CommonAttachmentsService } from '../../model/shared/common-attachments.service';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { PromotionDetailsService } from 'src/app/model/promotions/promotion-details.service';
import { PromotionsService } from 'src/app/model/promotions/promotions.service';
import { catchError } from 'rxjs/operators';
import { b2bPromotions } from 'src/integration/b2b-promotions';
import { UnsubscribeComponent } from '../common/unsubscribe.component';

@Component({
    selector: 'app-promotions',
    templateUrl: './promotions.component.html',
    styleUrls: ['./promotions.component.scss'],
    host: { class: 'app-promotions view-with-sidebar' },
    encapsulation: ViewEncapsulation.None,
})
export class PromotionsComponent extends UnsubscribeComponent  implements OnInit {

    r: ResourcesService;
    activePromotionId: number;
    error: string;
    menuItems: b2b.MenuItem[];
    activePromotion: b2bPromotions.ListItem;
    columns: b2bDocuments.ColumnConfig[];

    attachments: b2bShared.Attachment[];


    constructor(
        resourcesService: ResourcesService,
        public promotionsService: PromotionsService,
        public promotionDetailsService: PromotionDetailsService,
        public configService: ConfigService,
        private menuService: MenuService,
        private commonAttachmentsService: CommonAttachmentsService
    ) {
        super();
        this.r = resourcesService;
    }

    ngOnInit() {
        this.menuService.loadFullMenuItems().then(() => {

            this.menuItems = [
                this.menuService.defaultBackItem
            ];

            const promotionMenuItem = this.menuService.fullMenuItems.find(item => item.url.includes(this.menuService.routePaths.promotions));

            if (promotionMenuItem) {
                this.menuItems.push(promotionMenuItem);
            }

        });

        if (!this.promotionsService.items) {
            this.loadList();
        }

        this.registerSub(this.commonAttachmentsService.attachmentsChanged$.subscribe((attachments: b2bShared.Attachment[]) => {
            this.attachments = attachments;
        }));

        this.registerSub(this.promotionDetailsService.unitsChanged$.subscribe(() => {
            this.promotionDetailsService.productsOrDetails = this.promotionDetailsService.productsOrDetails.slice();
        }));


        if (this.promotionDetailsService.id) {
            const index = this.promotionsService.items.findIndex(item => item.id === this.promotionDetailsService.id);
            this.setActivePromotionData(this.promotionDetailsService.id, index);
        }
    }


    loadList() {
        this.error = null;

        this.configService.loaderSubj.next(true);

        return this.promotionsService.loadList().pipe(catchError((err: HttpErrorResponse) => {

            this.handleLoadingErrors(err);
            this.configService.loaderSubj.next(false);
            return of(err);
        }))
        .subscribe(() => {

            if (this.promotionsService.items.length === 0) {
                this.error = this.r.translations.noPromotions;
            }

            this.configService.loaderSubj.next(false);

        });
    }

    loadDetails(id: number): Observable<b2bPromotions.DetailsResponseUnified> {

        this.configService.loaderSubj.next(true);

        return this.promotionDetailsService.loadDetails(id).pipe(
            catchError(err => {
                this.handleLoadingErrors(err);

                this.configService.loaderSubj.next(false);

                return of(err);
            })
        );


    }


    handleLoadingErrors(err: HttpErrorResponse) {

        if (!this.configService.isOnline && (this.promotionsService.items === undefined || this.promotionDetailsService.productsOrDetails === undefined)) {
            this.error = this.r.translations.noDataInOfflineMode;
        }

        if (err.status === 403) {
            this.error = this.r.translations.promotionForbidden;
        }

        if (err.status === 404) {
            this.error = this.r.translations.promotionNotFound;
        }

    }

    changeDetailsPage(pageNumber) {

        this.promotionDetailsService.pagination.changePage(pageNumber, undefined, this.configService.isMobile);

        this.loadDetails(this.activePromotionId).subscribe(() => {
            this.configService.loaderSubj.next(false);
        });
    }


    loadActive(id, index) {

        if (id === this.activePromotionId) {
            return;
        }

        this.promotionDetailsService.productsOrDetails = undefined;

        this.promotionDetailsService.pagination.goToStart(undefined, this.configService.isMobile);

        this.loadDetails(id).subscribe(() => {

            this.setActivePromotionData(id, index);

            if (this.activePromotion.type === PromotionType.PLT || this.activePromotion.type === PromotionType.KNT) {
                this.configService.loaderSubj.next(false);
                return;
            }

            const ids = this.promotionDetailsService.productsOrDetails
                .filter(prod => !prod.unitLockChange && prod.promotionPositionType !== 1)
                .map(prod => prod.id);

            if (ids.length > 0) {
                this.promotionDetailsService.loadUnits(ids).subscribe(() => {
                    this.promotionDetailsService.productsOrDetails = this.promotionDetailsService.productsOrDetails.slice();
                    this.configService.loaderSubj.next(false);
                });
            }

            this.configService.loaderSubj.next(false);

        });

    }

    setActivePromotionData(id, index) {
        this.activePromotionId = id;
        this.activePromotion = Object.assign(this.promotionsService.items[index], { index: index });


        if (this.activePromotion.cyclicity) {
            this.activePromotion.cyclicityInfo = this.createCyclicityInfo();
        }

        if (this.activePromotion.type === PromotionType.PLT) {
            this.promotionDetailsService.productsOrDetails.forEach(product => {
                delete product.id;
            });
        }

        this.promotionDetailsService.refreshAttachments();

        if (this.activePromotion.type === PromotionType.PLT || this.activePromotion.type === PromotionType.KNT) {
            this.switchColumns(this.activePromotion.type);
            return;
        }


        const groups = this.promotionDetailsService.productsOrDetails.filter(product => product.promotionPositionType === 1);
        const onlyGroups = groups.length === this.promotionDetailsService.productsOrDetails.length;

        if (onlyGroups) {
            this.switchColumns('onlyGroups');
        } else {
            this.switchColumns(this.activePromotion.type);
        }
    }

    unitConverter(index: number) {
        this.promotionDetailsService.convertUnits(index, this.promotionDetailsService.productsOrDetails[index].unitId)
    }

    createCyclicityInfo() {

        const formatPipe = new FormatPipe();

        let cyclicityTypeString: string;
        let cyclicityValuesArgsString: string;
        let cyclicityValuesString: string;
        let cyclicityRangeString: string;
        let cyclicityHoursString: string;

        if (this.activePromotion.cyclicity.values) {
            cyclicityValuesArgsString = this.activePromotion.cyclicity.values
                .map(val => this.r.translations[ConvertingUtils.lowercaseFirstLetter(val)])
                .join(', ');
        }

        switch (this.activePromotion.cyclicity.type) {

            case CyclicityType.days:

                if (this.activePromotion.cyclicity.value === 1) {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryDay1'], this.activePromotion.cyclicity.value);
                } else {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryDay2_'], this.activePromotion.cyclicity.value);
                }

                break;

            case CyclicityType.weeks:

                if (this.activePromotion.cyclicity.value === 1) {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryWeek1'], this.activePromotion.cyclicity.value);
                } else if (this.activePromotion.cyclicity.value > 1 && this.activePromotion.cyclicity.value <= 4) {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryWeek2_4'], this.activePromotion.cyclicity.value);
                } else {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryWeek5_'], this.activePromotion.cyclicity.value);
                }

                if (cyclicityValuesArgsString) {
                    cyclicityValuesString = formatPipe.transform(this.r.translations['promotionEveryWeekDays'], cyclicityValuesArgsString);
                }

                break;

            case CyclicityType.months:

                if (this.activePromotion.cyclicity.value === 1) {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryMonth1'], this.activePromotion.cyclicity.value);
                } else if (this.activePromotion.cyclicity.value > 1 && this.activePromotion.cyclicity.value <= 4) {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryMonth2_4'], this.activePromotion.cyclicity.value);
                } else {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryMonth5_'], this.activePromotion.cyclicity.value);
                }

                break;

            case CyclicityType.years:

                if (this.activePromotion.cyclicity.value === 1) {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryYear1'], this.activePromotion.cyclicity.value);
                } else if (this.activePromotion.cyclicity.value > 1 && this.activePromotion.cyclicity.value <= 4) {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryYear2_4'], this.activePromotion.cyclicity.value);
                } else {
                    cyclicityTypeString = formatPipe.transform(this.r.translations['promotionEveryYear5_'], this.activePromotion.cyclicity.value);
                }

                if (cyclicityValuesArgsString) {
                    cyclicityValuesString = formatPipe.transform(this.r.translations['promotionEveryYearMonths'], cyclicityValuesArgsString);
                }

                if (this.activePromotion.cyclicity.range) {
                    cyclicityRangeString = formatPipe.transform(this.r.translations['promotionEveryYearsDays'], this.activePromotion.cyclicity.range);
                }

                break;

            case CyclicityType.hours:

                cyclicityTypeString = this.r.translations['promotionEveryDay1'];

                break;

        }

        if (this.activePromotion.cyclicity.hours) {
            cyclicityHoursString = formatPipe.transform(this.r.translations['promotionHours'], this.activePromotion.cyclicity.hours);
        }


        return [cyclicityTypeString, cyclicityValuesString, cyclicityRangeString, cyclicityHoursString]
            .filter(el => el !== undefined);
    }


    switchColumns(type?: PromotionType | 'onlyGroups') {

        if (type === PromotionType.PLT) {

            this.columns = [

                { property: 'name', translation: 'paymentForm' },
                { property: 'threshold' },
                { property: 'value', type: 'promotionValue' },
                {
                    property: 'type', translation: 'discountType', type: 'cases', cases: [
                        { case: 1, translation: 'percentage' },
                        { case: 2, translation: 'discountValue' },
                        { case: 3, translation: 'fixedPrice' }
                    ]
                },
                {
                    property: 'vatDirection', translation: 'priceType', type: 'cases', cases: [
                        { case: 'N', translation: 'net' },
                        { case: 'B', translation: 'gross' }
                    ]
                }
            ];

        } else if (type === 'onlyGroups') {

            this.columns = [

                { property: 'name', translation: 'articles' },
                { property: 'threshold' },
                { property: 'value', type: 'promotionValue' },
                {
                    property: 'type', translation: 'discountType', type: 'cases', cases: [
                        { case: 1, translation: 'percentage' },
                        { case: 2, translation: 'discountValue' },
                        { case: 3, translation: 'fixedPrice' }
                    ]
                },
                {
                    property: 'vatDirection', translation: 'priceType', type: 'cases', cases: [
                        { case: 'N', translation: 'net' },
                        { case: 'B', translation: 'gross' }
                    ]
                }
            ];


        } else {

            this.columns = [

                { property: 'name', translation: 'codeName', type: 'productName' },
                { property: 'threshold' },
                { property: 'value', type: 'promotionValue' },
                {
                    property: 'type', translation: 'discountType', type: 'cases', cases: [
                        { case: 1, translation: 'percentage' },
                        { case: 2, translation: 'discountValue' },
                        { case: 3, translation: 'fixedPrice' }
                    ]
                },
                {
                    property: 'vatDirection', translation: 'priceType', type: 'cases', cases: [
                        { case: 'N', translation: 'net' },
                        { case: 'B', translation: 'gross' }
                    ]
                },
                { property: 'addToCart', translation: '', type: 'addToCart' }
            ];
        }
    }


    clearDetails() {
        this.promotionDetailsService.productsOrDetails = undefined;
        this.promotionDetailsService.id = undefined;
        this.activePromotion = <any>{};
        this.activePromotionId = undefined;
        this.promotionDetailsService.pagination.goToStart();
    }
}
