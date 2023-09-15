import { Component, ViewEncapsulation, OnDestroy, HostBinding, ComponentFactoryResolver, ViewContainerRef, ViewChild, ComponentRef, OnInit } from '@angular/core';
import { ResourcesService } from '../../src/app/model/resources.service';
import { ConfigService } from '../../src/app/model/config.service';
import { SliderComponent } from '../../src/app/controls/slider/slider.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UiUtils } from '../../src/app/helpers/ui-utils';
import { LazyImageComponent } from 'src/app/controls/lazy-image/lazy-image.component';
import { b2b } from 'src/b2b';

@Component({
    selector: 'app-home',
    templateUrl: './old/home.component_o.html',
    styleUrls: ['./home.component.scss'],
    host: { class: 'app-home' },
    encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnDestroy, OnInit {

    r: ResourcesService;

    @HostBinding('class.view-with-sidebar')
    isSidebar: boolean;

    groupsOpened: boolean;

    @ViewChild('container', { read: ViewContainerRef, static: true })
    container: ViewContainerRef;

    safeContent: SafeHtml;
    dynamicSliders: ComponentRef<SliderComponent>[];

    dynamicImages: ComponentRef<LazyImageComponent>[];

    treeParameters: b2b.TreeParameters;

    constructor(
        resourcesService: ResourcesService,
        public configService: ConfigService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private domSanitizer: DomSanitizer,
    ) {
        this.r = resourcesService;
        this.treeParameters = {
            groupId: 0,
            parentId: null
        };
    }

    ngOnInit(): void {
        this.dynamicSliders = [];
        this.dynamicImages = [];
        this.configService.loaderSubj.next(false);
        this.groupsOpened = false;
        this.isSidebar = this.configService.permissions.hasAccessToArticleList;

        this.r.translationsPromise.then(() => {
            this.safeContent = this.domSanitizer.bypassSecurityTrustHtml(this.r.translations.homePageContent);

            window.setTimeout(() => {
                const sliders = this.container.element.nativeElement.querySelectorAll('[appslider], [appSlider], [app-slider]');

                if (sliders.length > 0) {
                    sliders.forEach(slider => {
                        this.dynamicSliders.push(UiUtils.createDynamicComponent(slider, this.container, SliderComponent, this.componentFactoryResolver));
                    });
                }

                const images = this.container.element.nativeElement.querySelectorAll('[applazyimage], [appLazyImage], [app-lazy-image]');

                if (images.length > 0) {
                    images.forEach(image => {
                        this.dynamicImages.push(UiUtils.createDynamicComponent(image, this.container, LazyImageComponent, this.componentFactoryResolver));
                    });
                }
            }, 0);
        });
    }

    handleGroupsVisibility(visibility?: boolean) {

        if (visibility === undefined) {

            this.groupsOpened = !this.groupsOpened;

        } else {

            this.groupsOpened = visibility;
        }
    }

    ngOnDestroy(): void {

        this.dynamicSliders.forEach(slider => {
            UiUtils.destroyDynamicComponent(slider);
        });

        this.dynamicImages.forEach(image => {
            UiUtils.destroyDynamicComponent(image);
        });
    }
}

