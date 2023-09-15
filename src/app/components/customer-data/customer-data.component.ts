import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { b2b } from '../../../b2b';
import { b2bShippingAddress } from 'src/integration/shared/b2b-shipping-address';
import { CustomerService } from '../../model/customer.service';
import { ResourcesService } from '../../model/resources.service';
import { MenuService } from '../../model/menu.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { ConfigService } from '../../model/config.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { FormMode } from '../../model/shared/enums/form-mode.enum';
import { catchError } from 'rxjs/operators';
import { Config } from '../../helpers/config';
import { AddressFormService } from '../address-form/services/address-form.service';
import { ApplicationType } from '../../model/enums/application-type.enum';

@Component({
    selector: 'app-customer-data',
    templateUrl: './customer-data.component.html',
    host: { 'class': 'app-customer-data view-with-sidebar' },
    styleUrls: ['./customer-data.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CustomerDataComponent implements OnInit, OnDestroy {

    private paramsSub: Subscription;

    r: any;
    customer: CustomerService;
    menuItems: b2b.MenuItem[];
    path: string;

    error: string;
    errorImgId: string;
    errorMessage: string;

    isAddAddressFormOpened: boolean;
    shippingAddressLoading: boolean;

    constructor(
        private activatedRoute: ActivatedRoute,
        public configService: ConfigService,
        customerService: CustomerService,
        resourcesService: ResourcesService,
        private menuService: MenuService,
        private domSanitizer: DomSanitizer,
        private addressFormService: AddressFormService,
    ) {
        this.r = resourcesService;
        this.customer = customerService;
    }

    ngOnInit() {
        let dataPromise: Promise<any> = null;

        this.paramsSub = this.activatedRoute.url.subscribe(res => {

            this.path = res[0].path;

            this.menuService.loadFullMenuItems().then(() => {

                this.menuItems = [
                    this.menuService.defaultBackItem,

                ];

                const currentMenuItem = this.menuService.fullMenuItems.find(item => item.url.includes(this.path));

                if (currentMenuItem) {
                    this.menuItems.push(currentMenuItem);
                }

            });

            if (this.path.includes('employees')) {
                if (this.customer.employees === undefined) {

                    this.configService.loaderSubj.next(true);
                    this.error = null;

                    dataPromise = this.customer.loadContacts().then(() => {

                        this.customer.employees.forEach(emp => {
                            emp.skypeUrl = this.domSanitizer.bypassSecurityTrustUrl('skype:' + emp.skype);
                        });
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

            } else {

                if (this.customer.details === undefined) {

                    this.configService.loaderSubj.next(true);
                    this.error = null;

                    dataPromise = this.customer.loadCustomerData().catch(err => {
                        return Promise.reject(err);
                    });
                } else {
                    if (this.configService.applicationId === ApplicationType.ForXL) {
                        this.customer.refreshShippingAddresses();
                    }
                }
            }

            if (dataPromise !== null) {

                dataPromise.then(() => {
                    this.customer.getAttributes().then(() => {
                        this.configService.loaderSubj.next(false);
                    });
                }).catch((err: HttpErrorResponse) => {

                    this.configService.loaderSubj.next(false);

                    if (!this.configService.isOnline && (this.customer === undefined || this.customer.employees === undefined || this.customer.details === undefined)) {
                        this.error = this.r.translations.noDataInOfflineMode;
                    }

                    if (err.status === 403) {
                        this.error = this.r.translations.forbidden;
                    }
                });
            }
        });
    }

    onOpenAddressForm() {
        this.prepareAddressForm(FormMode.AddFixedAddressType);
    }

    private prepareAddressForm(formMode: FormMode) {
        this.isAddAddressFormOpened = true;
        this.clearErrorMessage();

        const formData = this.prepareAddressFormInputData(formMode);
        this.addressFormService.prepareAddressForm(formData);
    }

    private prepareAddressFormInputData(formMode: FormMode): b2bShippingAddress.AddressFormInitData {
        return { formMode, editModelData: null, manageManyAddressForms: true, addAddressFormName: Config.profileAddShippingAddressFormName };
    }

    onCloseAddressForm() {
        this.isAddAddressFormOpened = false;
    }

    onSubmitShippingAddress(data: b2bShippingAddress.AddressFormSubmitData) {
        this.isAddAddressFormOpened = false;

        switch (data.formMode) {
            case FormMode.AddFixedAddressType:
            case FormMode.AddAnyAddressType:
                this.addShippingAddress(data.shippingAddressModel);
                break;
        }
    }

    private addShippingAddress(shippingAddressModel: b2bShippingAddress.ShippingAddressRequestModel) {
        this.shippingAddressLoading = true;
        this.customer.addShippingAddress(shippingAddressModel).pipe(
            catchError((error) => {
                this.errorMessage = this.prepareAddingAddressFailedMessage();
                return of(error);
            })
        ).subscribe(() => {
            this.shippingAddressLoading = false;
        });
    }

    private prepareAddingAddressFailedMessage() {
        return `${this.r.translations.addingAddressFailed}. ${this.r.translations.contactWithSeller}.`;
    }

    private clearErrorMessage() {
        this.errorMessage = null;
    }


    ngOnDestroy(): void {
        this.paramsSub.unsubscribe();
        this.addressFormService.clearSelectedAddressesData();
    }
}
