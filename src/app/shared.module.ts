import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPipe } from './helpers/pipes/format.pipe';
import { HighlightPipe } from './helpers/pipes/highlight.pipe';
import { IterableToArrayPipe } from './helpers/pipes/iterable-to-array.pipe';
import { PercentOrEmpty } from './helpers/pipes/percent-or-empty';
import { ToPricePipe } from './helpers/pipes/to-price.pipe';
import { ModalComponent } from './controls/modal/modal.component';
import { DropdownComponent } from './controls/dropdown/dropdown.component';
import { LoadingComponent } from './controls/loading/loading.component';
import { FloatingLabelInputComponent } from './controls/floating-label-input/floating-label-input.component';
import { PagerComponent } from './controls/pager/pager.component';
import { StepperComponent } from './controls/stepper/stepper.component';
import { CheckboxComponent } from './controls/checkbox/checkbox.component';
import { RadioComponent } from './controls/radio/radio.component';
import { CollapserComponent } from './controls/collapser/collapser.component';
import { SliderComponent } from './controls/slider/slider.component';
import { ProductsTableComponent } from './components/products-table/products-table.component';
import { LazyImageComponent } from './controls/lazy-image/lazy-image.component';
import { SelectComponent } from './controls/select/select/select.component';
import { OptionComponent } from './controls/select/option/option.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu.component';
import { LazySrcDirective } from './helpers/directives/lazy-src.directive';
import { MenuComponent } from './components/menu/menu.component';
import { GroupsComponent } from './components/groups/groups.component';
import { GlobalHttpInterceptor } from './model/global-http-interceptor';
import { AccountService } from './model/account.service';
import { NavigableByKeyboardComponent } from './controls/navigable-by-keyboard/navigable-by-keyboard.component';
import { ImportCartResultsComponent } from './components/import-cart-results/import-cart-results.component';
import { ImportCartResultsViewComponent } from './components/import-cart-results-view/import-cart-results-view.component';
import { SvgImageComponent } from './controls/svg-image/svg-image.component';
import { FileIconComponent } from './controls/file-icon/file-icon.component';
import { OldPagerComponent } from './controls/old-pager/old-pager.component';
import { RemoveTimePipe } from './helpers/pipes/remove-time.pipe';
import { MenuService } from './model/menu.service';
import { WidthOfParentDirective } from './helpers/directives/width-of-parent.directive';
import { FormatDatePipe } from './helpers/pipes/format-date.pipe';
import { SplitPipe } from 'src/app/helpers/pipes/split-prod-name';
import { ReplacePipe } from 'src/app/helpers/pipes/replace.pipe';
import { PercentPipe } from './helpers/pipes/percent.pipe';
import { CartSelectComponent } from './components/cart-select/cart-select.component';
import { ArticleGridComponent } from './components/article-grid/article-grid.component';
import { MaterialModule } from './material.module';
import { ThresholdPriceListComponent } from './components/threshold-price-list/threshold-price-list.component';
import { StatusComponent } from './components/status/status.component';
import { ImageComponent } from './controls/image/image.component';
import { AttachmentsComponent } from './controls/attachments/attachments.component';
import { AddressFormComponent } from './components/address-form/address-form.component';
import { SwitchComponent } from './controls/switch/switch.component';
import { UnsubscribeComponent } from './components/common/unsubscribe.component';
import { JoinPipe } from './helpers/pipes/join.pipe';
import { ApiExtensionsComponent } from './components/api-extensions/api-extensions.component';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule
    ],
    declarations: [
        GroupsComponent,
        MenuComponent,
        FormatPipe,
        HighlightPipe,
        IterableToArrayPipe,
        PercentOrEmpty,
        ToPricePipe,
        ModalComponent,
        DropdownComponent,
        LoadingComponent,
        FloatingLabelInputComponent,
        PagerComponent,
        OldPagerComponent,
        StepperComponent,
        CheckboxComponent,
        RadioComponent,
        CollapserComponent,
        SliderComponent,
        ProductsTableComponent,
        LazySrcDirective,
        LazyImageComponent,
        SelectComponent,
        OptionComponent,
        ProfileMenuComponent,
        NavigableByKeyboardComponent,
        ImportCartResultsComponent,
        ImportCartResultsViewComponent,
        SvgImageComponent,
        FileIconComponent,
        RemoveTimePipe,
        WidthOfParentDirective,
        FormatDatePipe,
        ReplacePipe,
        SplitPipe,
        PercentPipe,
        CartSelectComponent,
        ArticleGridComponent,
        ThresholdPriceListComponent,
        StatusComponent,
        ImageComponent,
        AttachmentsComponent,
        AddressFormComponent,
        SwitchComponent,
        UnsubscribeComponent,
        JoinPipe,
        ApiExtensionsComponent
    ],
    exports: [
        HttpClientModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MenuComponent,
        GroupsComponent,
        FormatPipe,
        HighlightPipe,
        IterableToArrayPipe,
        PercentOrEmpty,
        ToPricePipe,
        ModalComponent,
        DropdownComponent,
        LoadingComponent,
        FloatingLabelInputComponent,
        PagerComponent,
        OldPagerComponent,
        StepperComponent,
        CheckboxComponent,
        RadioComponent,
        CollapserComponent,
        SliderComponent,
        ProductsTableComponent,
        LazySrcDirective,
        LazyImageComponent,
        SelectComponent,
        OptionComponent,
        ProfileMenuComponent,
        NavigableByKeyboardComponent,
        SvgImageComponent,
        FileIconComponent,
        RemoveTimePipe,
        WidthOfParentDirective,
        FormatDatePipe,
        ReplacePipe,
        SplitPipe,
        PercentPipe,
        CartSelectComponent,
        ArticleGridComponent,
        MaterialModule,
        ThresholdPriceListComponent,
        StatusComponent,
        ImageComponent,
        AttachmentsComponent,
        AddressFormComponent,
        SwitchComponent,
        UnsubscribeComponent,
        JoinPipe,
        ApiExtensionsComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: GlobalHttpInterceptor,
            deps: [Router, AccountService, MenuService],
            multi: true
        }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class SharedModule {}
