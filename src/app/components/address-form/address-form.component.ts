import { Component, ViewEncapsulation, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { b2bShared } from 'src/integration/b2b-shared';
import { b2bShippingAddress } from 'src/integration/shared/b2b-shipping-address';
import { ResourcesService } from '../../model/resources.service';
import { ConfigService } from '../../model/config.service';
import { FormMode } from '../../model/shared/enums/form-mode.enum';
import { AddressType } from '../../model/shared/enums/address-type.enum';
import { CustomValidators } from '../../helpers/validators/custom-validators';
import { AddressFormService } from './services/address-form.service';
import { EditAddressStatus } from './enums/edit-address-status.enum';
import { AddressFormTheme } from './enums/address-form-theme.enum';

@Component({
    selector: 'app-address-form',
    templateUrl: './address-form.component.html',
    styleUrls: ['./address-form.component.scss'],
    host: { 'class': 'app-address-form' },
    encapsulation: ViewEncapsulation.None
})
export class AddressFormComponent implements OnInit, OnDestroy {

    private initAddressFormEventSubscription: Subscription;
    private countriesSubscription: Subscription;
    private countryChangedSubscription: Subscription;

    @Input()
    editAddressId?: number;

    @Input()
    addAddressFormName?: string;

    @Input()
    theme: AddressFormTheme;

    @Input()
    showCloseButton: boolean;

    @Output()
    save: EventEmitter<b2bShippingAddress.AddressFormSubmitData>;

    form: FormGroup;
    disableSubmitBtn: boolean;

    formMode: FormMode;
    private editFormData: b2bShippingAddress.ShippingAddressXl;

    addressType: AddressType;
    countries: b2bShared.Country[];
    private defaultCountry: b2bShared.Country;

    tempAddressDisabled: boolean;
    permAddressDisabled: boolean;
    isChangeAddressTypeAllowed: boolean;

    constructor(
        public r: ResourcesService,
        private configService: ConfigService,
        private addressFormService: AddressFormService) {

        this.save = new EventEmitter<b2bShippingAddress.AddressFormSubmitData>();
        this.disableSubmitBtn = false;
        this.isChangeAddressTypeAllowed = false;
        this.theme = AddressFormTheme.Primary;
        this.showCloseButton = false;
    }

    ngOnInit() {
        this.form = new FormGroup({
            companyName: new FormControl(null, [Validators.required]),
            nameAndLastName: new FormControl(null),
            street: new FormControl(null, [Validators.required]),
            zipCode: new FormControl(null, [Validators.required]),
            city: new FormControl(null, [Validators.required]),
            countryId: new FormControl(null),
            phoneNumber: new FormControl(null),
            email: new FormControl(null, [CustomValidators.email]),
        });

        this.countriesSubscription = this.addressFormService.updateCountriesSummaryEvent$.subscribe(summary => {
            if (!summary) {
                return;
            }

            this.countries = summary.countries;
            this.defaultCountry = summary.defaultCountry;
            this.form.patchValue({
                countryId: this.defaultCountry ? this.defaultCountry.id : null
            });
        });

        this.countryChangedSubscription = this.form.get('countryId').valueChanges.subscribe((countryId) => {
            if (!this.countries) {
                return;
            }
            const selectedCountry = this.countries.find(country => country.id === countryId);
            const currentZipCodeRegex = selectedCountry ? selectedCountry.zipCodeRegex : null;
            if (currentZipCodeRegex) {
                this.form.get('zipCode').setValidators([Validators.required, CustomValidators.zipCode(currentZipCodeRegex)]);
            } else {
                this.form.get('zipCode').setValidators([Validators.required]);
            }
            this.form.get('zipCode').updateValueAndValidity();
        });

        this.initAddressFormEventSubscription = this.addressFormService.initAddressFormEvent$.subscribe(formData => {
            this.prepareForm(formData);
        });
    }

    private prepareForm(formData: b2bShippingAddress.AddressFormInitData) {
        if (!formData) {
            return;
        }

        switch (formData.formMode) {
            case FormMode.EditAnyAddressType:
            case FormMode.EditFixedAddressType:
                this.prepareEditForm(formData);
                break;
            default:
                this.prepareAddForm(formData);
                break;
        }

        this.disableSubmitBtn = false;
    }

    private prepareAddForm(formData: b2bShippingAddress.AddressFormInitData) {
        if (formData.manageManyAddressForms && (formData.addAddressFormName !== this.addAddressFormName)) {
            return;
        }

        this.prepareCommonFormData(formData.formMode);

        this.form.reset({
            countryId: this.defaultCountry ? this.defaultCountry.id : null
        });

        if (this.configService.permissions.hasAccessToAddTempShippingAddress) {
            this.addressType = AddressType.Temp;
        } else {
            this.addressType = AddressType.Perm;
        }

        this.tempAddressDisabled = !this.configService.permissions.hasAccessToAddTempShippingAddress;
        this.permAddressDisabled = !this.configService.permissions.hasAccessToAddPermShippingAddress;
    }

    private prepareEditForm(formData: b2bShippingAddress.AddressFormInitData) {
        if (formData.manageManyAddressForms && (formData.editModelData && formData.editModelData.addressId !== this.editAddressId)) {
            return;
        }

        this.editFormData = formData.editModelData;
        this.prepareCommonFormData(formData.formMode);

        this.form.reset({
            companyName: this.editFormData.companyName,
            nameAndLastName: this.editFormData.nameAndLastName,
            street: this.editFormData.street,
            zipCode: this.editFormData.zipCode,
            city: this.editFormData.city,
            countryId: this.editFormData.country.id,
            phoneNumber: this.editFormData.phoneNumber,
            email: this.editFormData.email
        });
        this.addressType = this.editFormData.addressType;

        switch (this.addressType) {
            case AddressType.Temp:
                if (!this.configService.permissions.hasAccessToAddPermShippingAddress) {
                    this.permAddressDisabled = true;
                }
                break;
            case AddressType.Perm:
                this.tempAddressDisabled = true;
                break;
        }

        this.addressFormService.changeEditAddressStatus(this.editFormData.addressId, EditAddressStatus.StartEditing);
    }

    private prepareCommonFormData(formMode: FormMode) {
        this.formMode = formMode;
        this.updateChangeAddressTypePossibility();
    }

    private updateChangeAddressTypePossibility() {
        switch (this.formMode) {
            case FormMode.AddAnyAddressType:
            case FormMode.EditAnyAddressType:
                this.isChangeAddressTypeAllowed = true;
                break;
            default:
                this.isChangeAddressTypeAllowed = false;
        }
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.disableSubmitBtn = true;
            return;
        }

        const submitData = this.prepareSubmitData();
        this.save.emit(submitData);
        this.changeEditAddressStatusIfRequired();
    }

    onCancel() {
        this.changeEditAddressStatusIfRequired();
    }

    private changeEditAddressStatusIfRequired() {
        if (this.formMode === FormMode.EditAnyAddressType || this.formMode === FormMode.EditFixedAddressType) {
            this.addressFormService.changeEditAddressStatus(this.editFormData.addressId, EditAddressStatus.CompleteEditing);
        }
    }

    private prepareSubmitData(): b2bShippingAddress.AddressFormSubmitData {
        return {
            shippingAddressModel: this.prepareShippingAddressModel(),
            isAddressTemp: Number(this.addressType) === AddressType.Temp,
            addressId: this.formMode === FormMode.EditAnyAddressType || this.formMode === FormMode.EditFixedAddressType ? this.editFormData.addressId : null,
            formMode: this.formMode,
        };
    }

    private prepareShippingAddressModel(): b2bShippingAddress.ShippingAddressRequestModel {
        const values = this.form.value;
        return {
            companyName: values.companyName,
            nameAndLastName: values.nameAndLastName,
            street: values.street,
            zipCode: values.zipCode,
            city: values.city,
            countryId: values.countryId,
            phoneNumber: values.phoneNumber,
            email: values.email,
        };
    }

    ngOnDestroy(): void {
        if (this.countriesSubscription) {
            this.countriesSubscription.unsubscribe();
        }

        if (this.countryChangedSubscription) {
            this.countryChangedSubscription.unsubscribe();
        }

        if (this.initAddressFormEventSubscription) {
            this.initAddressFormEventSubscription.unsubscribe();
        }
    }
}
