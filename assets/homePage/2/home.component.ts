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
    templateUrl: './home.component.html',
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

    categories: b2b.CategoriesHomePage[];

    categoriesIcons: b2b.CategoriesHomePageIcon[];

    productNews: b2b.ProductNews[];

    news: b2b.News[];

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
        this.categories = [
            {
                id: 0,
                header: "Narzędzia ręczne",
                buttonURL: "['/nowosci']",
                imageSrc: "/ClientApp/assets/images/main-page/categories/1.Narzedzia_Reczne.jpg",
                imageAlt: "narzedzia-reczne"
            },
            {
                id: 1,
                header: "Systemy zamocowań",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/2.Systemy_Mocowan.jpg",
                imageAlt: "systemy-zamocowań"
            },
            {
                id: 2,
                header: "Osprzęt do elektronarzędzi",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/3.Osprzet_do_elektronarzedzi.jpg",
                imageAlt: "osprzet-do-elektronarzedzi"
            },
            {
                id: 3,
                header: "Elektronarzędzia",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/4.Elektroanrzedzia.jpg",
                imageAlt: "elektronarzedzia"
            },
            {
                id: 4,
                header: "Narzędzia ogrodnicze",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/5.Narzedzia_ogrodowe.jpg",
                imageAlt: "narzedzia-ogrodnicze"
            },
            {
                id: 5,
                header: "Odzież i akcesoria BHP",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/6.Odziez_i_akcesoria_BHP.jpg",
                imageAlt: "odziez-i-akcesoria-bhp"
            },
            {
                id: 6,
                header: "Narzędzia budowlane",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/7.Akcesoria_malarskie.jpg",
                imageAlt: "narzedzia-budowlane"
            },
            {
                id: 7,
                header: "Chemia techniczna",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/8.Narzedzia_budowlane.jpg",
                imageAlt: "chemia-techniczna"
            },
            {
                id: 8,
                header: "Akcesoria malarskie",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/9.Chemia_techniczna.jpg",
                imageAlt: ""
            },
            {
                id: 9,
                header: "Wyposażenie",
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/main-page/categories/10.Wyposazenie.jpg",
                imageAlt: ""
            },
        ];

        this.categoriesIcons =[
            {
                id: 1,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "narzędzia-ręczne"
            },
            {
                id: 2,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: ""
            },
            {
                id: 3,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "narzędzia-ręczne"
            },
            {
                id: 4,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "narzędzia-ręczne"
            },
            {
                id: 5,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "narzędzia-ręczne"
            },
            {
                id: 6,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "narzędzia-ręczne"
            },
            {
                id: 7,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "narzędzia-ręczne"
            },
            {
                id: 8,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "narzędzia-ręczne"
            },
            {
                id: 9,
                buttonURL: "",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "narzędzia-ręczne"
            },
        ];

        this.productNews =[
            {
                id: 1,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
            {
                id: 2,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
            {
                id: 3,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
            {
                id: 4,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
            {
                id: 5,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
            {
                id: 6,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
            {
                id: 7,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
            {
                id: 8,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
            {
                id: 9,
                name: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                imageSrc: "/ClientApp/assets/images/products-icons/prod_test.png",
                imageAlt: "Wiertarko-wkrętarka Akumulatorowa 18V z udarem",
                productURL: ""
            },
        ];

        this.news = [
            {
                //data ma format MM-DD-YYYY
                id: 1,
                date: "06-08-2022",
                title: "Wiertnice diamentowe stalco perfect",
                description: "Poznajcie naszą tegoroczną nowość! Wiertnice diamentowe STALCO PERFECT Wiertnice diamentowe STALCO PERFECT Wiertnice diamentowe STALCO PERFECT",
                tags: ["wiertnice","diamentowe","stalcoperfect"],
                types:["News","Ogrodnictwo","News","Ogrodnictwo"],
                imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
                imageAlt: "Wiertnice diamentowe stalco perfect",
                url: ""
            },
            {
                id: 2,
                date: "05-22-2022",
                title: "Wiertnice diamentowe stalco",
                description: "",
                tags: [],
                types:[],
                imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
                imageAlt: "Wiertnice diamentowe stalco perfect",
                url: ""
            },
            {
                id: 3,
                date: "12-17-2021",
                title: "Wiertnice diamentowe stalco perfect",
                description: "",
                tags: ["wiertnice",],
                types:[],
                imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
                imageAlt: "Wiertnice diamentowe stalco perfect",
                url: ""
            },
            {
                id: 4,
                date: "10-08-2021",
                title: "Wiertnice diamentowe stalco perfect",
                description: "",
                tags: ["wiertnice",],
                types:[],
                imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
                imageAlt: "Wiertnice diamentowe stalco perfect",
                url: ""
            },
            {
                id: 5,
                date: "06-29-2021",
                title: "Wiertnice diamentowe stalco perfect",
                description: "",
                tags: ["wiertnice",],
                types:[],
                imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
                imageAlt: "Wiertnice diamentowe stalco perfect",
                url: ""
            },
            {
                id: 6,
                date: "04-08-2021",
                title: "Wiertnice diamentowe stalco perfect",
                description: "",
                tags: ["wiertnice",],
                types:[],
                imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
                imageAlt: "Wiertnice diamentowe stalco perfect",
                url: ""
            },
            {
                id: 7,
                date: "02-14-2021",
                title: "Wiertnice diamentowe stalco perfect",
                description: "",
                tags: ["wiertnice",],
                types:[],
                imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
                imageAlt: "Wiertnice diamentowe stalco perfect",
                url: ""
            },
            {
                id: 8,
                date: "01-22-2021",
                title: "Wiertnice diamentowe stalco perfect",
                description: "",
                tags: ["wiertnice",],
                types:[],
                imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
                imageAlt: "Wiertnice diamentowe stalco perfect",
                url: ""
            },
        ];
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
