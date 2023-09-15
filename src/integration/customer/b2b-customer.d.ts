import { b2bShippingAddress } from '../shared/b2b-shipping-address';

export module b2bCustomer {

    //-----requests

    interface ChangeShippingAddressBaseRequest {
        shippingAddressModel: b2bShippingAddress.ShippingAddressRequestModel;
    }

    interface UpdateShippingAddressXlRequest extends ChangeShippingAddressBaseRequest { }
    interface AddShippingAddressXlRequest extends ChangeShippingAddressBaseRequest { }

    //-----responses

    interface GetCustomerAttributeResponseBase {
        attributes: CustomerAttribute[];
    }
    interface GetCustomerAttributeResponseXl extends GetCustomerAttributeResponseBase { }
    interface GetCustomerAttributeResponseAltum extends GetCustomerAttributeResponseBase { }


    interface GetShippingAddressesXlResponse {
        shippingAddresses: b2bShippingAddress.ShippingAddressXl[];
    }

    interface AddShippingAddressXlResponse {
        shippingAddress: b2bShippingAddress.ShippingAddressXl;
    }

    //--------other
    interface CustomerAttribute {
        type: number;
        name: string;
        value: string;
    }
}
