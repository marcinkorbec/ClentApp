import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { b2bShippingAddress } from 'src/integration/shared/b2b-shipping-address';
import { b2bShared } from 'src/integration/b2b-shared';
import { EditAddressStatus } from '../enums/edit-address-status.enum';
import { FormMode } from '../../../model/shared/enums/form-mode.enum';


@Injectable({
    providedIn: 'root'
})
export class AddressFormService {

    private currentEditableAddresses: b2bShared.GenericCollection<number, boolean>;

    private initAddressFormEvent: BehaviorSubject<b2bShippingAddress.AddressFormInitData>;
    initAddressFormEvent$: Observable<b2bShippingAddress.AddressFormInitData>;

    private editableAddressesChanged: BehaviorSubject<b2bShared.GenericCollection<number, boolean>>;
    editableAddressesChanged$: Observable<b2bShared.GenericCollection<number, boolean>>;

    private updateCountriesSummaryEvent: BehaviorSubject<b2bShared.CountriesSummary>;
    updateCountriesSummaryEvent$: Observable<b2bShared.CountriesSummary>;

    constructor() {
        this.initAddressFormEvent = new BehaviorSubject<b2bShippingAddress.AddressFormInitData>(null);
        this.initAddressFormEvent$ = this.initAddressFormEvent as Observable<b2bShippingAddress.AddressFormInitData>;

        this.editableAddressesChanged = new BehaviorSubject<b2bShared.GenericCollection<number, boolean>>({});
        this.editableAddressesChanged$ = this.editableAddressesChanged as Observable<b2bShared.GenericCollection<number, boolean>>;

        this.updateCountriesSummaryEvent = new BehaviorSubject<b2bShared.CountriesSummary>(null);
        this.updateCountriesSummaryEvent$ = this.updateCountriesSummaryEvent as Observable<b2bShared.CountriesSummary>;

        this.currentEditableAddresses = {};
    }

    prepareAddressForm(addressFormInputData: b2bShippingAddress.AddressFormInitData) {
        if (!addressFormInputData) {
            return;
        }

        if (addressFormInputData.manageManyAddressForms) {
            switch (addressFormInputData.formMode) {
                case FormMode.EditAnyAddressType:
                case FormMode.EditFixedAddressType:
                    this.changeEditAddressStatus(addressFormInputData.editModelData.addressId, EditAddressStatus.StartEditing);
            }
        }

        this.initAddressFormEvent.next(addressFormInputData);
    }

    changeEditAddressStatus(addressId: number, status: EditAddressStatus) {
        switch (status) {
            case EditAddressStatus.StartEditing:
                this.currentEditableAddresses[addressId] = true;
                break;
            case EditAddressStatus.CompleteEditing:
                delete this.currentEditableAddresses[addressId];
                break;
        }

        this.emitEditableAddressesChangedEvent();
    }

    updateCountriesSummary(countriesSummary: b2bShared.CountriesSummary) {
        this.updateCountriesSummaryEvent.next(countriesSummary);
    }

    clearSelectedAddressesData() {
        this.currentEditableAddresses = {};
        this.emitEditableAddressesChangedEvent();
        this.initAddressFormEvent.next(null);
    }

    private emitEditableAddressesChangedEvent() {
        this.editableAddressesChanged.next({ ...this.currentEditableAddresses });
    }
}
