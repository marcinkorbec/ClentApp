import { b2bShared } from '../b2b-shared';
import { AddressType } from '../../app/model/shared/enums/address-type.enum';
import { FormMode } from '../../app/model/shared/enums/form-mode.enum';
import { SaveAddressStatus } from '../../app/model/shared/enums/save-address-status.enum';

export module b2bShippingAddress {

    interface ShippingAddressRequestModel {
        companyName: string;
        nameAndLastName?: string;
        street: string;
        zipCode: string;
        city: string;
        countryId: number;
        phoneNumber: string;
        email: string;
    }

    interface ShippingAddressBase {
        addressId: number;
        companyName: string;
        nameAndLastName?: string;
        street: string;
        zipCode: string;
        city: string;
        country: b2bShared.Country;
        phoneNumber: string;
        email: string;
        isTempAddress: boolean;
        isPossibleToEdit: boolean;
    }

    interface ShippingAddressXl extends ShippingAddressBase {
        addressType: AddressType;
    }

    interface AddressFormInitData {
        formMode: FormMode;
        editModelData: ShippingAddressXl;
        manageManyAddressForms: boolean;
        addAddressFormName?: string;
    }

    interface AddressFormSubmitData {
        shippingAddressModel: ShippingAddressRequestModel;
        isAddressTemp?: boolean;
        addressId?: number;
        formMode: FormMode;
    }

    interface UpdateShippingAddressesSummary {
        shippingAddresses: ShippingAddressXl[];
        updatedAddressId?: number;
        updatedAddressStatus?: AddressFormStatus;
    }

    interface AddressFormStatus {
        saveAddressStatus?: SaveAddressStatus;
        status: b2bShared.Status;
    }
}
