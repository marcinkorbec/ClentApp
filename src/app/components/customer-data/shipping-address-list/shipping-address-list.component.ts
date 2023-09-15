import { Component, OnInit, ViewEncapsulation, Input, OnDestroy } from '@angular/core';
import { b2bShippingAddress } from 'src/integration/shared/b2b-shipping-address';
import { FormMode } from '../../../model/shared/enums/form-mode.enum';
import { b2bShared } from 'src/integration/b2b-shared';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../model/customer.service';
import { CountryService } from '../../../model/shared/country.service';
import { AddressFormService } from '../../address-form/services/address-form.service';

@Component({
    selector: 'app-shipping-address-list',
    templateUrl: './shipping-address-list.component.html',
    host: { 'class': 'app-shipping-address-list' },
    styleUrls: ['./shipping-address-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ShippingAddressListComponent implements OnInit, OnDestroy {

    private editableAddressesChangedSubscription: Subscription;
    private shippingAddressesChangedSubscription: Subscription;
    private countriesChangedSubscription: Subscription;

    @Input()
    translations: any;

    shippingAddressesSummary: b2bShippingAddress.UpdateShippingAddressesSummary;

    currentEditableAddresses: b2bShared.GenericCollection<number, boolean>;
    addressFormStatus: b2bShippingAddress.AddressFormStatus;
    currentUpdatedAddressId: number;

    constructor(
        private addressFormService: AddressFormService,
        private customerService: CustomerService,
        private countryService: CountryService
    ) {
        this.currentEditableAddresses = {};
    }

    ngOnInit() {
        this.editableAddressesChangedSubscription = this.addressFormService.editableAddressesChanged$.subscribe(currentEditableAddresses => {
            this.currentEditableAddresses = currentEditableAddresses;
        });

        this.shippingAddressesChangedSubscription = this.customerService.shippingAddressesChanged$.subscribe(res => {
            this.shippingAddressesSummary = res as b2bShippingAddress.UpdateShippingAddressesSummary;

            this.addressFormService.clearSelectedAddressesData();
            this.currentUpdatedAddressId = null;
        });

        this.countriesChangedSubscription = this.countryService.countriesChanged.subscribe(res => {
            const countriesSummary = res as b2bShared.CountriesSummary;
            this.addressFormService.updateCountriesSummary(countriesSummary);
        });
    }

    onClickEditAddress(address: b2bShippingAddress.ShippingAddressXl) {
        this.prepareAddressForm(FormMode.EditFixedAddressType, address);
    }

    private prepareAddressForm(formMode: FormMode, editModelData: b2bShippingAddress.ShippingAddressXl = null) {
        this.shippingAddressesSummary = this.customerService.prepareCleanShippingAddressSummary(this.shippingAddressesSummary);
        const formData = this.prepareAddressFormInputData(formMode, editModelData);
        this.addressFormService.prepareAddressForm(formData);
    }

    private prepareAddressFormInputData(formMode: FormMode, editModelData: b2bShippingAddress.ShippingAddressXl): b2bShippingAddress.AddressFormInitData {
        return { formMode, editModelData, manageManyAddressForms: true };
    }

    onSubmitShippingAddress(data: b2bShippingAddress.AddressFormSubmitData) {
        switch (data.formMode) {
            case FormMode.EditFixedAddressType:
            case FormMode.EditAnyAddressType:
                this.currentUpdatedAddressId = data.addressId;
                this.customerService.updateShippingAddress(data.addressId, data.shippingAddressModel).subscribe();
                break;
        }
    }

    ngOnDestroy(): void {
        this.editableAddressesChangedSubscription.unsubscribe();
        this.shippingAddressesChangedSubscription.unsubscribe();
        this.countriesChangedSubscription.unsubscribe();
    }
}
