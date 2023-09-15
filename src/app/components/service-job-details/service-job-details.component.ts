import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { b2b } from 'src/b2b';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from 'src/app/model/config.service';
import { MenuService } from 'src/app/model/menu.service';
import { ResourcesService } from 'src/app/model/resources.service';
import { Config } from '../../helpers/config';
import { ServiceJobDetailsService } from 'src/app/model/service-jobs/service-job-details.service';
import { b2bServiceJobs } from 'src/integration/b2b-service-jobs';

@Component({
    selector: 'app-service-job-details',
    templateUrl: './service-job-details.component.html',
    styleUrls: ['./service-job-details.component.scss'],
    host: { class: 'app-service-job-details app-document-details' },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceJobDetailsComponent implements OnInit, OnDestroy {

    backMenuItem: b2b.MenuItem;
    currentMenuItem: b2b.MenuItem;

    detailsPopupVisible: boolean;
    popupData: b2bServiceJobs.DeviceActionDetails;

    paymentsPopupVisible: boolean;

    serviceDetailsImageHeight: number;
    serviceDetailsImageWidth: number;

    constructor(
        private activatedRoute: ActivatedRoute,
        public configService: ConfigService,
        public menuService: MenuService,
        private router: Router,
        public serviceJobDetailsService: ServiceJobDetailsService,
        private changeDetector: ChangeDetectorRef,
        public r: ResourcesService
    ) {
        this.serviceDetailsImageHeight = Config.defaultArticleTableItemImageHeight;
        this.serviceDetailsImageWidth = Config.defaultArticleTableItemImageWidth;
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {

            this.configService.loaderSubj.next(true);

            this.loadDetails(params.id);

            this.menuService.loadFullMenuItems().then(res => {
                const defaultBackMenu = Object.assign({}, this.menuService.fullMenuItems.find(item => this.router.url.includes(item.url)));
                this.backMenuItem = this.menuService.convertLabelToBack(defaultBackMenu, 'back');
                this.changeDetector.markForCheck();
            });


        });
    }


    loadDetails(id) {
        this.configService.loaderSubj.next(true);

        return this.serviceJobDetailsService.loadDetails(id).subscribe(() => {
            this.changeDetector.markForCheck();
            this.configService.loaderSubj.next(false);
        });

    }


    loadDeviceActions(deviceId) {
        return this.serviceJobDetailsService.loadDeviceActions(deviceId).subscribe((res) => {
            this.changeDetector.markForCheck();
            return res;
        });
    }


    loadDeviceActionDetails(actionId, deviceId) {

        this.popupData = null;

        return this.serviceJobDetailsService.loadDeviceActionDetails(actionId, deviceId).subscribe((res) => {
            this.popupData = res;
            this.changeDetector.markForCheck();
            return res;
        });
    }


    changeRowCollapserVisibility(row: any, visibility?: boolean, visibilityProperty = 'opened') {

        if (typeof visibility === 'boolean') {
            row[visibilityProperty] = visibility;
        } else {
            row[visibilityProperty] = !row[visibilityProperty];
        }

    }


    changePopupVisibility(popupType: 'actionDetails' | 'payments', visibility?: boolean) {

        if (popupType === 'actionDetails') {
            if (typeof visibility === 'boolean') {
                this.detailsPopupVisible = visibility;
            } else {
                this.detailsPopupVisible = !this.detailsPopupVisible;
            }
        } else {
            if (typeof visibility === 'boolean') {
                this.paymentsPopupVisible = visibility;
            } else {
                this.paymentsPopupVisible = !this.detailsPopupVisible;
            }
        }
    }


    loadPayments() {
        this.serviceJobDetailsService.loadPayments().subscribe((res) => {
            this.changeDetector.markForCheck();
            return res;
        });
    }

    print() {
        this.serviceJobDetailsService.clearDetailsBoxMessages();
        this.serviceJobDetailsService.print().subscribe(() => {
            this.changeDetector.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.serviceJobDetailsService.clearDetailsBoxMessages();
    }
}
