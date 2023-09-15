import { Component, ViewEncapsulation, OnDestroy, HostBinding, ComponentFactoryResolver, ViewContainerRef, ViewChild, ComponentRef, OnInit, Inject } from '@angular/core';
import { ResourcesService } from '../../src/app/model/resources.service';
import { ConfigService } from '../../src/app/model/config.service';
import { SliderComponent } from '../../src/app/controls/slider/slider.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UiUtils } from '../../src/app/helpers/ui-utils';
import { LazyImageComponent } from 'src/app/controls/lazy-image/lazy-image.component';
import { b2b } from 'src/b2b';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from 'src/app/model/news.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
//import { MatDialog } from '@angular/material/dialog';
//import {MaterialModule} from 'src/app/material.module'
//import { NewsService } from 'src/app/model/news.service';
//import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [NewsService],
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

    news: b2b.NewsListItem[];

    creditInfo: b2b.HeaderCustomerInfo;

    error: string;

    constructor(
        resourcesService: ResourcesService,
        public configService: ConfigService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private domSanitizer: DomSanitizer,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        public newsService: NewsService,
        public dialog: MatDialog
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
                buttonURL: "/items/55806?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/1.Narzedzia_Reczne_n.jpg",
                imageAlt: "narzedzia-reczne"
            },
            {
                id: 1,
                header: "Wyposażenie",
                buttonURL: "/items/55807?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/10.Wyposazenie_n.jpg",
                imageAlt: "wyposazenie"
            },
            {
                id: 2,
                header: "Narzędzia budowlane",
                buttonURL: "/items/55808?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/8.Narzedzia_budowlane_n.jpg",
                imageAlt: "narzedzia-budowlane"
            },
            {
                id: 3,
                header: "Akcesoria malarskie",
                buttonURL: "/items/55809?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/7.Akcesoria_malarskie_n.jpg",
                imageAlt: "akcesoria-malarskie"
            },
            {
                id: 4,
                header: "Elektronarzędzia",
                buttonURL: "/items/55810?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/4.Elektroanrzedzia_n.jpg",
                imageAlt: "elektronarzedzia"
            },
            {
                id: 5,
                header: "Osprzęt do elektronarzędzi",
                buttonURL: "/items/55811?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/3.Osprzet_do_elektronarzedzi_n.jpg",
                imageAlt: "osprzet-do-elektronarzedzi"
            },
            {
                id: 6,
                header: "Systemy zamocowań",
                buttonURL: "/items/55812?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/2.Systemy_Mocowan_n.jpg",
                imageAlt: "systemy-zamocowań"
            },
            {
                id: 7,
                header: "Chemia techniczna i budowlana",
                buttonURL: "/items/55813?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/9.Chemia_techniczna_n.jpg",
                imageAlt: "chemia-techniczna"
            },
            {
                id: 8,
                header: "Odzież i akcesoria BHP",
                buttonURL: "/items/55814?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/6.Odziez_i_akcesoria_BHP_n.jpg",
                imageAlt: "odziez-i-akcesoria-bhp"
            },
            {
                id: 9,
                header: "Narzędzia ogrodnicze",
                buttonURL: "/items/55815?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/5.Narzedzia_ogrodowe_n.jpg",
                imageAlt: "narzedzia-ogrodnicze"
            },
        ];

        this.categoriesIcons = [
            {
                id: 0,
                buttonURL: "/items/55806?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/1.Narzedzia_reczne_ikona_czarna.svg",
                imageAlt: "narzędzia-ręczne"
            },
            {
                id: 1,
                buttonURL: "/items/55807?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/10.Wyposazenie_ikona_czarna.svg",
                imageAlt: "wyposażenie"
            },
            {
                id: 2,
                buttonURL: "/items/55808?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/7.Narzedzia_budowlane_ikona_czarna.svg",
                imageAlt: "narzędzia-budowlane"
            },
            {
                id: 3,
                buttonURL: "/items/55809?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/8.Akcesoria_malarskie_ikona_czarna.svg",
                imageAlt: "akcesoria-malarskie"
            },
            {
                id: 4,
                buttonURL: "/items/55810?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/4.Elektronarzedzia_ikona_czarna.svg",
                imageAlt: "elektronarzędzia"
            },
            {
                id: 5,
                buttonURL: "/items/55811?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/3.Osprzet_do_elektronarzedzi_ikona_czarna.svg",
                imageAlt: "osprzęt-elektronarzędzi"
            },
            {
                id: 6,
                buttonURL: "/items/55812?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/2.Systemy_zamocowan_ikona_czarna.svg",
                imageAlt: "systemy-mocowań"
            },
            {
                id: 7,
                buttonURL: "/items/55813?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/9.Chemia_teczhniczna_i_budowlana_ikona_czarna.svg",
                imageAlt: "chemia-techniczna"
            },
            {
                id: 8,
                buttonURL: "/items/55814?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/6.Odziez_i_akcesoria_bhp_ikona_czarna.svg",
                imageAlt: "odzież-i-akcesoria-bhp"
            },
            {
                id: 9,
                buttonURL: "/items/55815?parent=0",
                imageSrc: "/ClientApp/assets/images/products-icons/5.Narzedzia_ogrodowe_ikona_czarna.svg",
                imageAlt: "narzędzia-ogrodowe"
            },
        ];

        this.productNews = [
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

        // this.news = [
        //     {
        //         //data ma format MM-DD-YYYY
        //         id: 1,
        //         date: "06-08-2022",
        //         title: "Wiertnice diamentowe stalco perfect",
        //         description: "Poznajcie naszą tegoroczną nowość! Wiertnice diamentowe STALCO PERFECT Wiertnice diamentowe STALCO PERFECT Wiertnice diamentowe STALCO PERFECT",
        //         tags: ["wiertnice","diamentowe","stalcoperfect"],
        //         types:["News","Ogrodnictwo","News","Ogrodnictwo"],
        //         imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
        //         imageAlt: "Wiertnice diamentowe stalco perfect",
        //         url: ""
        //     },
        //     {
        //         id: 2,
        //         date: "05-22-2022",
        //         title: "Wiertnice diamentowe stalco",
        //         description: "",
        //         tags: [],
        //         types:[],
        //         imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
        //         imageAlt: "Wiertnice diamentowe stalco perfect",
        //         url: ""
        //     },
        //     {
        //         id: 3,
        //         date: "12-17-2021",
        //         title: "Wiertnice diamentowe stalco perfect",
        //         description: "",
        //         tags: ["wiertnice",],
        //         types:[],
        //         imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
        //         imageAlt: "Wiertnice diamentowe stalco perfect",
        //         url: ""
        //     },
        //     {
        //         id: 4,
        //         date: "10-08-2021",
        //         title: "Wiertnice diamentowe stalco perfect",
        //         description: "",
        //         tags: ["wiertnice",],
        //         types:[],
        //         imageSrc: "/ClientApp/assets/images/main-page/aktualnosci_test.png",
        //         imageAlt: "Wiertnice diamentowe stalco perfect",
        //         url: ""
        //     },
        // ];
    }

    ngOnInit(): void {
        this.dynamicSliders = [];
        this.dynamicImages = [];
        this.configService.loaderSubj.next(false);
        this.groupsOpened = false;
        this.isSidebar = this.configService.permissions.hasAccessToArticleList;

        //Pg zmiana
        //Pobieranie 3 ostatnich wpisów
        this.newsService.requestList("", "", "").then((res) => {
            res.length > 3 ? this.news = res.slice(0, 3) :
                this.news = res;
            this.news.forEach(element => {
                element.categories = element.category.split(",");
            });
        });
        //Pg koniec

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

        //popup
        // window.setTimeout(() => {
        //     this.openDialog();
        // }, 5000)
    }

    openDialog() {
        const popupRef = this.dialog.open(HomePagePopup);
        popupRef.afterClosed().subscribe(res => {
            console.log(`Dialog result: ${res}`);
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

@Component({
    selector: 'homepage-popup',
    templateUrl: '../../src/app/components/homepage-popup/homepage-popup.component.html',
})
export class HomePagePopup {

}
