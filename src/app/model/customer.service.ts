import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { b2b } from '../../b2b';
import { b2bShippingAddress } from 'src/integration/shared/b2b-shipping-address';
import { ConfigService } from './config.service';
import { Subject, Observable, BehaviorSubject, of } from 'rxjs';
import { b2bCustomer } from 'src/integration/customer/b2b-customer';
import { ApplicationType } from './enums/application-type.enum';
import { CustomerRequestsService } from './customer/customer-requests.service';
import { AddressType } from './shared/enums/address-type.enum';
import { CountryService } from './shared/country.service';
import { catchError, map } from 'rxjs/operators';
import { SaveAddressStatus } from './shared/enums/save-address-status.enum';
import { Config } from '../helpers/config';
import { b2bShared } from 'src/integration/b2b-shared';


@Injectable()
export class CustomerService {

    creditInfo: b2b.HeaderCustomerInfo;
    details: b2b.CustomerDetails;
    employees: b2b.Employee[];
    attributes: b2bCustomer.CustomerAttribute[];

    creditInfoChanged: Subject<b2b.HeaderCustomerInfo>;

    private shippingAddressesSummary: b2bShippingAddress.UpdateShippingAddressesSummary;
    private shippingAddressesChanged: BehaviorSubject<b2bShippingAddress.UpdateShippingAddressesSummary>;
    shippingAddressesChanged$: Observable<b2bShippingAddress.UpdateShippingAddressesSummary>;

    constructor(
        private httpClient: HttpClient,
        private configService: ConfigService,
        private customerRequestsService: CustomerRequestsService,
        private countryService: CountryService) {

        this.creditInfo = <b2b.HeaderCustomerInfo>{};
        this.creditInfoChanged = new Subject<b2b.HeaderCustomerInfo>();

        this.shippingAddressesChanged = new BehaviorSubject(null);
        this.shippingAddressesChanged$ = this.shippingAddressesChanged as Observable<b2bShippingAddress.UpdateShippingAddressesSummary>;
    }


    refreshShippingAddresses() {
        if (this.shippingAddressesSummary) {
            this.shippingAddressesSummary = this.prepareCleanShippingAddressSummary(this.shippingAddressesSummary);
            this.shippingAddressesChanged.next(this.shippingAddressesSummary);
            return;
        }

        this.getShippingAddressesRequest();
    }

    forceRefreshShippingAddressesFromRequest() {
        this.getShippingAddressesRequest();
    }

    prepareCleanShippingAddressSummary(summary: b2bShippingAddress.UpdateShippingAddressesSummary) {
        return {
            ...summary,
            updatedAddressId: null,
            updatedAddressStatus: null
        };
    }

    private getShippingAddressesRequest(updatedAddressId: number = null, updatedAddressStatus: b2bShippingAddress.AddressFormStatus = null) {
        this.customerRequestsService.getShippingAddressesXlRequest().subscribe(res => {
            const shippingAddresses = this.calculateShippingAddressesXl(res.shippingAddresses);

            this.shippingAddressesSummary = this.prepareUpdateShippingAddressesSummary(shippingAddresses, updatedAddressId, updatedAddressStatus);
            this.shippingAddressesChanged.next(this.shippingAddressesSummary);
        });
    }

    private prepareUpdateShippingAddressesSummary(shippingAddresses: b2bShippingAddress.ShippingAddressXl[], updatedAddressId: number, updatedAddressStatus: b2bShippingAddress.AddressFormStatus): b2bShippingAddress.UpdateShippingAddressesSummary {
        return { shippingAddresses, updatedAddressId, updatedAddressStatus };
    }

    private calculateShippingAddressesXl(addresses: b2bShippingAddress.ShippingAddressXl[]) {
        if (!addresses) {
            return addresses;
        }
        return addresses.map(address => {
            return this.calculateShippingAddressXl(address);
        });
    }

    private calculateShippingAddressXl(address: b2bShippingAddress.ShippingAddressXl) {
        if (!address) {
            return address;
        }
        return {
            ...address,
            addressType: address.isTempAddress ? AddressType.Temp : AddressType.Perm,
        };
    }

    updateShippingAddress(addressId: number, shippingAddressModel: b2bShippingAddress.ShippingAddressRequestModel): Observable<void> {
        const request = this.prepareChangeShippingAddressRequest(shippingAddressModel);
        return this.customerRequestsService.updateShippingAddressXlRequest(addressId, request).pipe(
            map(() => {
                const status = this.prepareChangeAddressStatus(SaveAddressStatus.EditedSuccessfully);
                this.getShippingAddressesRequest(addressId, status);
            }),
            catchError((err) => {
                const status = this.prepareChangeAddressStatus(SaveAddressStatus.EditingFailed);
                this.getShippingAddressesRequest(addressId, status);
                return of(err);
            })
        );
    }

    addShippingAddress(shippingAddressModel: b2bShippingAddress.ShippingAddressRequestModel): Observable<void> {
        const request = this.prepareChangeShippingAddressRequest(shippingAddressModel);
        return this.customerRequestsService.addShippingAddressXlRequest(request).pipe(
            map((result) => {
                if (result) {
                    const status = this.prepareChangeAddressStatus(SaveAddressStatus.AddedSuccessfully);
                    this.getShippingAddressesRequest(result.shippingAddress.addressId, status);
                }
            }));
    }

    private prepareChangeShippingAddressRequest(shippingAddressModel: b2bShippingAddress.ShippingAddressRequestModel): b2bCustomer.ChangeShippingAddressBaseRequest {
        return { shippingAddressModel };
    }

    private prepareChangeAddressStatus(saveAddressStatus: SaveAddressStatus): b2bShippingAddress.AddressFormStatus {
        const autoHide = saveAddressStatus === SaveAddressStatus.AddedSuccessfully || saveAddressStatus === SaveAddressStatus.EditedSuccessfully;

        const status = {
            isVisible: true,
            autoHide,
            autoHideTimeout: Config.autoHideStatusTimeout,
        } as b2bShared.Status;

        return { saveAddressStatus, status };
    }


    clearCustomerData() {
        this.details = undefined;
        this.creditInfo = undefined;
        this.employees = undefined;
        this.shippingAddressesSummary = null;
        this.shippingAddressesChanged.next(null);
    }

    private requestHeaderData(): Promise<b2b.CustomerHeaderResponse> {
        return this.httpClient.get<b2b.CustomerHeaderResponse>('/api/customer/header').toPromise();
    }

    loadHeaderData(): Promise<b2b.HeaderCustomerInfo> {

        const headerPromise = this.requestHeaderData().then((res) => {
            this.creditInfo = res.set1[0];
            return this.creditInfo;

        }).catch(err => {

            this.configService.handlePermissionsError(err);
            return err;
        });

        return headerPromise;

    }

    /**
    * Prepares request for customer data
    */
    private requestCustomerData(): Promise<b2b.CustomerDataResponse> {
        return this.httpClient.get<b2b.CustomerDataResponse>('/api/customer').toPromise();
    }

    private requestContacts(): Promise<b2b.EmployeesResponse> {
        return this.httpClient.get<b2b.EmployeesResponse>('/api/customer/contacts').toPromise();
    }


    loadCustomerData(): Promise<void> {

        return this.requestCustomerData().then(res => {
            this.details = res.set1[0];

            if (this.configService.applicationId === ApplicationType.ForXL) {
                this.refreshShippingAddresses();
                if (this.configService.permissions.hasAccessToAddPermShippingAddress) {
                    this.countryService.refreshCountriesIfRequired();
                }
            }
        });
    }

    loadContacts(): Promise<void> {

        return this.requestContacts().then(res => {
            this.employees = res.set1;
        });
    }

    refreshCreditInfo() {
        this.localRefreshCreditInfo().then((res) => {
            this.creditInfoChanged.next(res);
        });
    }

    private localRefreshCreditInfo() {
        return this.requestHeaderData().then((res) => {
            return this.creditInfo = res.set1[0];
        });
    }

    private requestAttributesXl(): Promise<b2bCustomer.GetCustomerAttributeResponseXl> {
        return this.httpClient.get<b2bCustomer.GetCustomerAttributeResponseXl>('/api/customer/attributesXl').toPromise();
    }

    private requestAttributesAltum(): Promise<b2bCustomer.GetCustomerAttributeResponseAltum> {
        return this.httpClient.get<b2bCustomer.GetCustomerAttributeResponseAltum>('/api/customer/attributesAltum').toPromise();
    }


    getAttributes(): Promise<void> {
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                return this.getAttributesXl();

            case ApplicationType.ForAltum:
                return this.getAttributesAltum();

            default:
                console.error(`getAttributes(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    private getAttributesXl(): Promise<void> {
        return this.requestAttributesXl().then(res => this.inCaseSuccessGetAttributesBase(res));
    }

    private getAttributesAltum(): Promise<void> {
        return this.requestAttributesAltum().then(res => this.inCaseSuccessGetAttributesBase(res));
    }

    private inCaseSuccessGetAttributesBase(res: b2bCustomer.GetCustomerAttributeResponseBase) {
        this.attributes = res.attributes;
    }
}
