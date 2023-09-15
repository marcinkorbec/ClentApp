import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ResourcesService } from './model/resources.service';
import { CustomerService } from './model/customer.service';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuService } from './model/menu.service';
import { HomeComponent, HomePagePopup } from '../../assets/homePage/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartsService } from './model/carts.service';
import { ConfigService } from './model/config.service';
import { AccountComponent } from './components/account/account.component';
import { ProductFlagsComponent } from './components/product-flags/product-flags.component';
import { SharedModule } from './shared.module';
import { b2b } from '../b2b';
import { ImportCartResultsViewComponent } from './components/import-cart-results-view/import-cart-results-view.component';
import { environment } from 'src/environments/environment';
import { CommonModalService } from './model/shared/common-modal.service';
import { CommonAvailableCartsService } from './model/shared/common-available-carts.service';
import { PrintHandlerService } from './model/shared/printhandler.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductsFiltersComponent } from './components/products/components/products-filters/products-filters.component';
import { ProductFiltersValuesComponent } from './components/products/components/product-filters-values/product-filters-values.component';
import { ProductsFiltersService } from './components/products/services/products-filters.service';
import { ProductsFiltersValuesService } from './components/products/services/products-filters-values.service';
import { ArticlesGroupFiltersService } from './components/products/services/articles-group-filters.service';
import { MultiChoiceFilterService } from './components/products/services/multi-choice-filter.service';
import { GlobalFiltersService } from './components/products/services/global-filters.service';
import { SingleChoiceFilterService } from './components/products/services/single-choice-filter.service';
import { CommonAttachmentsService } from './model/shared/common-attachments.service';
import { UpdateProductsFilterSetComponent } from './components/products/components/update-products-filter-set/update-products-filter-set.component';
import { UpdateProductsFilterSetService } from './components/products/services/update-products-filter-set.service';
import { ProductsFiltersSetsService } from './model/product/products-filters-sets.service';
import { ProductVariantsDetailsComponent } from './components/product-details/components/product-variants-details/product-variants-details.component';
import { ProductAvailabilityComponent } from './components/product-details/components/product-availability/product-availability.component';
import { ProductsVariantsService } from './components/product-details/services/product-variants.service';
import { ProductExpandedVariantComponent } from './components/product-details/components/product-expanded-variant/product-expanded-variant.component';
import { ProductExpandedVariantService } from './components/product-details/services/product-expanded-variant.service';
import { ProductPlannedDeliveriesComponent } from './components/product-details/components/product-planned-deliveries/product-planned-deliveries.component';
import { ProductLastOrderDetailsComponent } from './components/product-details/components/product-last-order-details/product-last-order-details.component';
import { ProductsSortingComponent } from './components/products/components/products-sorting/products-sorting.component';
import { ProductsSortingService } from './components/products/services/products-sorting.service';
import { ProductDetailsService }  from 'src/app/model/product-details.service';
import { HttpClient } from '@angular/common/http';
import { ApplicationType } from './model/enums/application-type.enum';
import { AltumContext } from './model/shared/erp/altum-context';
import { XLContext } from './model/shared/erp/xl-context';
import { ERPService } from './model/shared/erp/erp.service';
import { AccountService } from './model/account.service';
import { OrderDetailsService } from './model/orders/order-details.service';
import {PromocjeComponent} from './components/promocje/promocje.component';
import {PlanogramyComponent} from './components/planogramy/planogramy.component';
import {CennikComponent} from './components/cennik/cennik.component';
import {KatTechniczneComponent} from './components/katalogi-techniczne/katalogi-techniczne.component';
import {KartyTechniczneComponent} from './components/karty-techniczne/karty-techniczne.component';
import {DeklaracjeZgodnosciComponent} from './components/deklaracje-zgodnosci/deklaracje-zgodnosci.component';
import {LogoBrandbookComponent} from './components/logo-brandbook/logo-brandbook.component';
import {FilmyWebinaryComponent} from './components/filmy-webinary/filmy-webinary.component';
import {KontaktyComponent} from './components/kontakty/kontakty.component';
import {NarzedziaReczneComponent} from './components/narzedzia-reczne/narzedzia-reczne.component';
import {SystemyZamocowanComponent} from './components/systemy-zamocowan/systemy-zamocowan.component';
import {OsprzetElektronarzedziComponent} from './components/osprzet-elektronarzedzi/osprzet-elektronarzedzi.component';
import {ElektronarzedziaComponent} from './components/elektronarzedzia/elektronarzedzia.component';
import {NarzedziaOgrodoweComponent} from './components/narzedzia-ogrodowe/narzedzia-ogrodowe.component';
import {OdziezAkcesoriaBhpComponent} from './components/odziez-akcesoria-bhp/odziez-akcesoria-bhp.component';
import {NarzedziaBudowlaneComponent} from './components/narzedzia-budowlane/narzedzia-budowlane.component';
import {AkcesoriaMalarskieComponent} from './components/akcesoria-malarskie/akcesoria-malarskie.component';
import {ChemiaTechnicznaBudowlanaComponent} from './components/chemia-techniczna-budowlana/chemia-techniczna-budowlana.component';
import { NowosciComponent } from './components/nowosci/nowosci.component';


const routes: b2b.RouteWithKey[] = [

    { path: '', key: 'home', component: HomeComponent, canActivate: [AccountService] },

    {
        path: 'items', key: 'items', canActivate: [AccountService], children: [
            { path: '', redirectTo: '0', pathMatch: 'full' },
            { path: ':id', component: ProductsComponent },
        ]
    },

    {path: 'promocje', component: PromocjeComponent, canActivate: [AccountService]},
    {path: 'planogramyzatowarowania', component: PlanogramyComponent, canActivate: [AccountService]},
    {path: 'katalogocennik', component: CennikComponent, canActivate: [AccountService]},
    {path: 'katalogitechniczne', component: KatTechniczneComponent, canActivate: [AccountService]},
    {path: 'kartytechniczne', component: KartyTechniczneComponent, canActivate: [AccountService]},
    {path: 'deklaracjezgodnosci', component: DeklaracjeZgodnosciComponent, canActivate: [AccountService]},
    {path: 'logoibrandbook', component: LogoBrandbookComponent, canActivate: [AccountService]},
    {path: 'filmyiwebinary', component: FilmyWebinaryComponent, canActivate: [AccountService]},
    {path: 'kontakty', component: KontaktyComponent, canActivate: [AccountService]},
    {path: 'narzedziareczne', component: NarzedziaReczneComponent, canActivate: [AccountService]},
    {path: 'systemyzamocowan', component: SystemyZamocowanComponent, canActivate: [AccountService]},
    {path: 'osprzetdoelektronarzedzi', component: OsprzetElektronarzedziComponent, canActivate: [AccountService]},
    {path: 'elektronarzedzia', component: ElektronarzedziaComponent, canActivate: [AccountService]},
    {path: 'narzedziaogrodowe', component: NarzedziaOgrodoweComponent, canActivate: [AccountService]},
    {path: 'odziezakcesoriabhp', component: OdziezAkcesoriaBhpComponent, canActivate: [AccountService]},
    {path: 'narzedziabudowlane', component: NarzedziaBudowlaneComponent, canActivate: [AccountService]},
    {path: 'akcesoriamalarskie', component: AkcesoriaMalarskieComponent, canActivate: [AccountService]},
    {path: 'chemiatechnicznaibudowlana', component: ChemiaTechnicznaBudowlanaComponent, canActivate: [AccountService]},
    {path: 'nowosci', component: NowosciComponent, canActivate: [AccountService]},

    { path: 'itemdetails/:id', key: 'itemDetails', component: ProductDetailsComponent, canActivate: [AccountService] },

    { path: 'carts', key: 'cart', canActivate: [AccountService], loadChildren: () => import('./cart.module').then(m => m.CartModule) },

    { path: 'login', key: 'login', component: AccountComponent, canActivate: [AccountService] },
    { path: 'remind', key: 'remindPassword', component: AccountComponent, canActivate: [AccountService] },
    {
        path: 'remindpassword', key: 'resetPassword', canActivate: [AccountService], children: [
            { path: 'passwordreminder', key: 'resetPassword', component: AccountComponent },
        ]
    },

    { path: 'fileImportResult', key: 'fileImportResult', component: ImportCartResultsViewComponent, canActivate: [AccountService] },

    { path: 'profile', key: 'profile', canActivate: [AccountService], loadChildren: () => import('./customer-profile.module').then(m => m.CustomerProfileModule) },

    { path: '**', redirectTo: '', pathMatch: 'full' }

];

//const initialkeysForLazyModules: b2b.RouteWithKey[] = [
//    { key: 'employees', redirectTo: 'profile/employees' },
//    { key: 'files', redirectTo: 'profile/files' },
//    { key: 'inquiries', redirectTo: 'profile/inquiries' },
//    { key: 'pending', redirectTo: 'profile/pending' },
//    { key: 'orders', redirectTo: 'profile/orders' },
//    { key: 'promotions', redirectTo: 'profile/promotions' }
//];


export function appInitFactory(menuService: MenuService, httpClient: HttpClient, erpService: ERPService, configService: ConfigService) {

    return () => {

        menuService.configureRoutePaths(routes);

        let initResolve, initReject;
        const initPromise = new Promise<void>((resolve, reject) => {
            initReject = reject;
            initResolve = resolve;
        });

        httpClient.get<ApplicationType>('/account/getapplicationtype').subscribe(type => {

            switch (type) {

                case ApplicationType.ForXL:
                    erpService.setContext(new XLContext(httpClient));
                    configService.applicationId = ApplicationType.ForXL;
                    initResolve();
                    break;

                case ApplicationType.ForAltum:
                    erpService.setContext(new AltumContext(httpClient));
                    configService.applicationId = ApplicationType.ForAltum;
                    initResolve();
                    break;

                default:
                    console.error('ERP Application not supported');
                    initReject();
                    break;
            }

        });

        return initPromise;

    };
}


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        HeaderComponent,
        FooterComponent,
        ProductsComponent,
        ProductDetailsComponent,
        AccountComponent,
        ProductFlagsComponent,
        ProductsFiltersComponent,
        ProductFiltersValuesComponent,
        UpdateProductsFilterSetComponent,
        ProductVariantsDetailsComponent,
        ProductAvailabilityComponent,
        ProductExpandedVariantComponent,
        ProductPlannedDeliveriesComponent,
        ProductLastOrderDetailsComponent,
        ProductsSortingComponent,
        PlanogramyComponent,
        CennikComponent,
        KatTechniczneComponent,
        KartyTechniczneComponent,
        DeklaracjeZgodnosciComponent,
        LogoBrandbookComponent,
        FilmyWebinaryComponent,
        KontaktyComponent,
        NarzedziaReczneComponent,
        SystemyZamocowanComponent,
        OsprzetElektronarzedziComponent,
        ElektronarzedziaComponent,
        NarzedziaOgrodoweComponent,
        OdziezAkcesoriaBhpComponent,
        NarzedziaBudowlaneComponent,
        AkcesoriaMalarskieComponent,
        ChemiaTechnicznaBudowlanaComponent,
        NowosciComponent,
        PromocjeComponent,
        HomePagePopup
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
    SharedModule,
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' }),
        ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    providers: [
        ConfigService,
        AccountService,
        ResourcesService,
        CustomerService,
        ProductDetailsService,
        MenuService,
        CartsService,
        OrderDetailsService,
        CommonModalService,
        CommonAvailableCartsService,
        PrintHandlerService,
        ProductsFiltersService,
        ProductsFiltersValuesService,
        ArticlesGroupFiltersService,
        GlobalFiltersService,
        MultiChoiceFilterService,
        SingleChoiceFilterService,
        CommonAttachmentsService,
        UpdateProductsFilterSetService,
        ProductsFiltersSetsService,
        ProductsVariantsService,
        ProductExpandedVariantService,
        ProductsSortingService,
        {
            provide: APP_INITIALIZER,
            useFactory: appInitFactory,
            deps: [MenuService, HttpClient, ERPService, ConfigService],
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}


