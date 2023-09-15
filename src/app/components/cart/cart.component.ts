import { debounceTime } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { b2b } from '../../../b2b';
import { b2bShippingAddress } from 'src/integration/shared/b2b-shipping-address';
import { ResourcesService } from '../../model/resources.service';
import { CartDocumentType } from '../../model/enums/cart-document-type.enum';
import { CartsService } from '../../model/carts.service';
import { CartService } from '../../model/cart.service';
import { MenuService } from '../../model/menu.service';
import { NgForm } from '@angular/forms';
import { ConfigService } from '../../model/config.service';
import { DateHelper } from '../../helpers/date-helper';
import { HttpErrorResponse } from '@angular/common/http';
import { UiUtils } from '../../helpers/ui-utils';
import { CartDetailType } from 'src/app/model/cart/enums/cart-detail-type.enum';
import { ApplicationType } from 'src/app/model/enums/application-type.enum';
import { CommonAvailableCartsService } from 'src/app/model/shared/common-available-carts.service';
import { b2bCart } from 'src/integration/b2b-cart';
import { b2bCartHeader } from 'src/integration/b2b-cart-header';
import { b2bCartCheck } from 'src/integration/b2b-cart-check';
import { b2bArticleGrid } from 'src/integration/shared/b2b-article-grid';
import { QuantityDisplayType } from '../../model/shared/enums/quantity-display-type.enum';
import { b2bShared } from 'src/integration/b2b-shared';
import { FormMode } from '../../model/shared/enums/form-mode.enum';
import { SaveAddressStatus } from '../../model/shared/enums/save-address-status.enum';
import { Config } from '../../helpers/config';
import { CountryService } from '../../model/shared/country.service';
import { AddDocumentErrorType } from '../../model/shared/enums/add-document-error-type.enum';
import { AddressFormService } from '../address-form/services/address-form.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmikoBold, AmikoNormal } from "./fonts";
import { CustomerService } from 'src/app/model/customer.service';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss'],
    host: { 'class': 'app-cart' },
    encapsulation: ViewEncapsulation.None,
})
export class CartComponent implements OnInit, OnDestroy {

    id: number;
    private routeParamsSubscription: Subscription;
    private cartNameChangedSubscription: Subscription;
    private countriesChangedSubscription: Subscription;

    backMenuItem: b2b.MenuItem;
    productTableConfig: b2b.CartHeader & b2bShared.ProductTableConfig;

    cart: CartService;

    noteFormDisplay: boolean;
    collapsedOptions: boolean;

    selectedDocumentId: CartDocumentType;

    r: ResourcesService;

    keys: Function;

    savingData: boolean;

    message: string;

    @ViewChild('cartForm')
    cartForm: NgForm;

    @ViewChild('dueDate')
    dueDateInput: ElementRef<HTMLInputElement>;

    @ViewChild('receiptDate')
    receiptDateInput: ElementRef<HTMLInputElement>;

    removeConfirmModal: b2bCart.RemoveCartFromQuoteModal;

    private outdatedDetailsChangedSub: Subscription;
    outdatedProductsDetails: b2bCartCheck.CheckCartSummaryObjectBase[];

    removeUnavailableItemsModal: b2bCart.RemoveUnavailableItemsModal;
    unavailableCartItems: b2bCart.CartArticleListItemWithStockLevelBase[];
    unavailableCartItemsConfig: b2bArticleGrid.GridArticleConfig;
    /**
    * Watcher and debounce timer for all header attributes (important becouse of input event on text fields)
    */
    private attributesSubject: Subject<{ index: number, value?: any }>;
    private attributesSub: Subscription;

    /**
    * Watcher and debounce timer for all cart options (important becouse of input event on text fields)
    * Now is used only for source number, but it will be nessesary for every text input added in future.
    */
    private cartDetailsSubject: Subject<CartDetailType>;
    private cartDetailsSub: Subscription;

    /**
    * Watcher and debounce timer for all steppers (important becouse of input and click events)
    */
    private quantitySubject: Subject<{ index: number, quantity: number }>;
    private quantitySub: Subscription;

    isAddressFormOpened: boolean;
    addressFormStatus: b2bShippingAddress.AddressFormStatus;

    //PG zmiany - początek
    contactData: string;
    priceMargin: number;

    creditInfo: b2b.HeaderCustomerInfo;
    //isContactDataEmpty: boolean;
    expandedRowVisibility: boolean;
    //PG zmiany - koniec

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public configService: ConfigService,
        resourcesService: ResourcesService,
        private menuService: MenuService,
        public cartsService: CartsService,
        cartService: CartService,
        private commonAvailableCartsService: CommonAvailableCartsService,
        private countryService: CountryService,
        private addressFormService: AddressFormService,
        public customerService: CustomerService
    ) {

        this.r = resourcesService;
        this.cart = cartService;
        this.attributesSubject = new Subject<{ index: number, value?: any }>();
        this.cartDetailsSubject = new Subject<CartDetailType>();
        this.quantitySubject = new Subject<{ index: number, quantity: number }>();
        this.removeConfirmModal = {
            visibility: false
        };
        this.removeUnavailableItemsModal = {
            visibility: false
        };
        this.unavailableCartItemsConfig = {
            showCode: true,
            quantityDisplayType: QuantityDisplayType.Readonly
        };

        this.isAddressFormOpened = false;
        //PG zmiana - początek
        this.priceMargin = 0;
        this.expandedRowVisibility = true;
        //PG zmiana - koniec
    }

    ngOnInit() {
        this.cart.products = undefined;
        this.cart.orderNumber = null;
        this.configService.loaderSubj.next(false);
        this.configService.loaderSubj.next(false);
        this.savingData = false;
        this.noteFormDisplay = true;
        this.collapsedOptions = false;
        this.keys = Object.keys;
        this.configService.loaderSubj.next(true);

        this.countryService.refreshCountriesIfRequired();

        this.outdatedDetailsChangedSub = this.cart.outdatedDetailsChanged.subscribe((res: b2bCartCheck.OutdatedDetails) => {
            this.outdatedProductsDetails = res.allOutdatedProducts;
            this.unavailableCartItems = res.unavailableCartItems;
        });

        this.countriesChangedSubscription = this.countryService.countriesChanged.subscribe(summary => {
            this.addressFormService.updateCountriesSummary(summary);
        });

        this.routeParamsSubscription = this.activatedRoute.params.subscribe((res: any) => {
            this.configService.loaderSubj.next(true);
            this.cart.clearCartDetails();
            this.message = null;

            if (this.cart.cartId !== Number.parseInt(res.id)) {
                this.cart.pagination.goToStart();
            }

            this.id = Number.parseInt(res.id);
            this.cart.initCartId(res.id);

            this.cart.getCartDetails().then(() => {

                //cart config options are in both objects, but table component requires single config object
                this.productTableConfig = Object.assign({}, this.configService.config, this.cart.productsConfig, this.cart.headerData);
                this.configService.loaderSubj.next(false);

            }).catch(() => {

                if (!this.configService.isOnline && this.cart.products === undefined) {
                    this.message = this.r.translations.noDataInOfflineMode;
                }

                this.configService.loaderSubj.next(false);
            });
        });

        this.backMenuItem = this.menuService.defaultBackItem;


        //setting watchers with debounce timers

        this.quantitySub = this.quantitySubject.pipe(debounceTime(1000)).subscribe(() => {

            const quantityRequests: Promise<void>[] = [];

            this.cart.products.forEach((item) => {

                if (item.quantityChanged) {
                    if (this.cart.isCartFromQuote) {
                        quantityRequests.push(this.updateItemQuantityIfCartIsFromQuote(item));
                    } else {
                        quantityRequests.push(this.updateItemQuantity(item));
                    }
                }
            });

            Promise.all(quantityRequests).then(() => {
                this.savingData = false;
                this.cart.refreshCreditLimitIfRequired();
                this.cartsService.updateSpecificCart(this.id, this.cart.summaries);
            });
        });

        this.attributesSub = this.attributesSubject.pipe(debounceTime(1000)).subscribe((e) => {

            this.cart.updateHeaderAttribute(e.index, e.value).then(res => {
                this.savingData = false;
            });
        });

        this.cartDetailsSub = this.cartDetailsSubject.pipe(debounceTime(1000)).subscribe(this.inCaseCartDetailsSubscribe.bind(this));


        this.cartNameChangedSubscription = this.cartsService.cartNameChanged.subscribe((res: b2bCart.CartIdentifier) => {
            if (res.cartId === this.cart.cartId) {
                this.cart.updateCartName(res.cartName);
            }
        });
        //PG zmiana p
        this.customerService.loadHeaderData().then((res) => {
            this.creditInfo = res;
        });
        this.contactData = "";
        //PG zmiana k
    }

    private updateItemQuantity(currentProduct: b2b.CartProduct): Promise<void> {
        currentProduct.loading = true;
        this.cart.products = this.cart.products.slice(); //TODO refactor - get product as observable and remove this line
        return this.cart.updateItemQuantity(currentProduct.itemId, currentProduct.quantity).then(() => {
            currentProduct.quantityChanged = false;
            currentProduct.loading = false;
        });
    }

    private updateItemQuantityIfCartIsFromQuote(currentProduct: b2b.CartProduct): Promise<void> {
        currentProduct.loading = true;
        this.cart.products = this.cart.products.slice(); //TODO refactor - get product as observable and remove this line
        return this.cart.updateItemQuantityInCartFromQuote(currentProduct.itemId, currentProduct.quantity).then(() => {
            currentProduct.quantityChanged = false;
            currentProduct.loading = false;
        });
    }

    private inCaseCartDetailsSubscribe(type: CartDetailType) {
        switch (type) {
            case CartDetailType.sourceNumber:
                return this.inCaseUpdateSourceNumber();

            case CartDetailType.description:
                return this.inCaseUpdateDescription();
        }
    }

    private inCaseUpdateSourceNumber() {
        if (this.cart.isCartFromQuote) {
            this.cart.updateSourceNumberInCartFromQuote(this.id, this.cart.headerData.sourceNumber).then(() => { this.savingData = false; });
            return;
        }

        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.cart.updateSourceNumberXl(this.id, this.cart.headerData.sourceNumber).then(() => { this.savingData = false; });
                break;

            case ApplicationType.ForAltum:
                this.cart.updateSourceNumberAltum(this.id, this.cart.headerData.sourceNumber).then(() => { this.savingData = false; });
                break;

            default:
                console.error('inCaseUpdateSourceNumber(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
        }
    }

    private inCaseUpdateDescription() {
        if (this.cart.isCartFromQuote) {
            this.cart.updateDescriptionInCartFromQuote(this.id, this.cart.headerData.description).then(() => { this.savingData = false; });
            return;
        }

        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.cart.updateDescriptionXl(this.id, this.cart.headerData.description).then(() => { this.savingData = false; });
                break;

            case ApplicationType.ForAltum:
                this.cart.updateDescriptionAltum(this.id, this.cart.headerData.description).then(() => { this.savingData = false; });
                break;

            default:
                console.error('inCaseUpdateDescription(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
        }
    }


    changeNoteDisplay() {
        this.noteFormDisplay = !this.noteFormDisplay;
    }


    selectDelivery() {
        if (this.cart.deliveryLoaded) {
            const selectedDelivery = this.cart.deliveryMethods.find(item => item.name === this.cart.headerData.deliveryMethod);

            this.savingData = true;
            this.cart.headerData.deliveryMethod = selectedDelivery.name;
            this.cart.headerData.translationDeliveryMethod = selectedDelivery.translationName;

            if (this.cart.isCartFromQuote) {
                this.cart.updateDeliveryMethodInCartFromQuote(this.id, this.cart.headerData.deliveryMethod).then(() => { this.savingData = false; });
                return;
            }

            switch (this.configService.applicationId) {
                case ApplicationType.ForXL:
                    this.cart.updateDeliveryMethodXl(this.id, this.cart.headerData.deliveryMethod).then(() => {
                        this.cartsService.updateSpecificCart(this.id, this.cart.summaries);
                        this.savingData = false;
                    });
                    break;

                case ApplicationType.ForAltum:
                    const deliveryMethodNumber = Number(this.cart.headerData.deliveryMethod);
                    if (isNaN(deliveryMethodNumber)) {
                        console.error('selectDelivery(ERROR): Delivery method: (' + this.cart.headerData.deliveryMethod + ') is not a number, application type: ' + ApplicationType.ForAltum);
                        break;
                    }
                    this.cart.updateDeliveryMethodAltum(this.id, deliveryMethodNumber).then(() => { this.savingData = false; });
                    break;

                default:
                    console.error('selectDelivery(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
            }
        }
    }

    selectPayment() {

        if (this.cart.paymentsLoaded) {
            const selectedPayment: b2b.Option2 = this.cart.paymentForms.find((item: b2b.Option2) => {
                return item.id === this.cart.headerData.paymentFormId;
            });

            this.savingData = true;
            this.cart.headerData.paymentForm = selectedPayment.name;

            switch (this.configService.applicationId) {
                case ApplicationType.ForXL:
                    this.inCaseSelectPaymentInXl();
                    break;

                case ApplicationType.ForAltum:
                    this.inCaseSelectPaymentInAltum();
                    break;

                default:
                    console.error('selectPayment(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
            }
        }
    }

    private inCaseSelectPaymentInXl() {
        if (this.cart.isCartFromQuote) {
            this.cart.updatePaymentFormXlInCartFromQuote(this.id, this.cart.headerData.paymentFormId).then(() => { this.savingData = false; });
            return;
        }
        this.cart.updatePaymentFormXl(this.id, this.cart.headerData.paymentFormId).then(() => {
            this.cartsService.updateSpecificCart(this.id, this.cart.summaries);
            this.savingData = false;
        });
    }

    private inCaseSelectPaymentInAltum() {
        if (this.cart.isCartFromQuote) {
            this.cart.updatePaymentFormAltumInCartFromQuote(this.id, this.cart.headerData.paymentFormId).then(() => { this.savingData = false; });
            return;
        }
        this.cart.updatePaymentFormAltum(this.id, this.cart.headerData.paymentFormId).then(() => {
            this.cartsService.updateSpecificCart(this.id, this.cart.summaries);
            this.savingData = false;
        });
    }

    selectWarehouse() {
        if (this.cart.warehousesLoaded) {

            let warehouse: b2bCartHeader.WarehouseOption = this.cart.warehouses.find(item => item.id === this.cart.headerData.warehouseId);
            if (warehouse === undefined) {
                warehouse = { id: 0, name: '' };
            }
            this.cart.headerData.warehouseName = warehouse.name;

            this.savingData = true;

            if (this.cart.isCartFromQuote) {
                this.cart.updateWarehouseInCartFromQuote(this.id, this.cart.headerData.warehouseId).then(() => {
                    this.savingData = false;
                    this.cart.products = this.cart.products.slice(); //old comment - update refference to onPush table detection
                });
                return;
            }

            switch (this.configService.applicationId) {
                case ApplicationType.ForXL:
                    this.cart.updateWarehouseXl(this.id, this.cart.headerData.warehouseId).then(() => {
                        this.cartsService.updateSpecificCart(this.id, this.cart.summaries);
                        this.savingData = false;
                        this.cart.products = this.cart.products.slice(); //old comment - update refference to onPush table detection
                    });
                    break;

                case ApplicationType.ForAltum:
                    this.cart.updateWarehouseAltum(this.id, this.cart.headerData.warehouseId).then(() => {
                        this.savingData = false;
                        this.cart.products = this.cart.products.slice(); //old comment - update refference to onPush table detection
                    });
                    break;

                default:
                    console.error('selectWarehouse(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
            }
        }
    }


    selectShippingAddress() {
        if (!this.cart.adressesLoaded) {
            return;
        }

        this.savingData = true;

        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.selectShippingAddressXl();
                break;

            case ApplicationType.ForAltum:
                this.selectShippingAddressAltum();
                break;

            default:
                console.error('selectShippingAddress(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
        }
    }

    private selectShippingAddressXl() {
        const address = this.cart.shippingAddressesXl.find(address => address.addressId === this.cart.headerData.addressId);
        this.cart.headerData.shippingAddress = address;

        if (this.cart.isCartFromQuote) {
            this.cart.updateAddressInCartFromQuote(this.id, this.cart.headerData.addressId).then(() => { this.savingData = false; });
            return;
        }

        this.cart.updateAddressXl(this.id, this.cart.headerData.addressId).then(() => { this.savingData = false; });
    }

    private selectShippingAddressAltum() {
        const shippingAddress = this.cart.shippingAddresses.find(item => item.id === this.cart.headerData.addressId);
        this.cart.headerData.address = shippingAddress.name;

        if (this.cart.isCartFromQuote) {
            this.cart.updateAddressInCartFromQuote(this.id, this.cart.headerData.addressId).then(() => { this.savingData = false; });
            return;
        }

        this.cart.updateAddressAltum(this.id, this.cart.headerData.addressId).then(() => { this.savingData = false; });
    }


    selectComplection() {
        this.savingData = true;

        if (this.cart.isCartFromQuote) {
            this.cart.updateRealizationXlInCartFromQuote(this.id, this.cart.headerData.completionEntirely).then(() => { this.savingData = false; });
            return;
        }

        this.cart.updateRealizationXl(this.id, this.cart.headerData.completionEntirely).then(() => { this.savingData = false; });
    }


    changeItemQuantity(params) {
        this.savingData = true;
        this.cart.products[params.index].quantityChanged = true;
        this.quantitySubject.next({ index: params.index, quantity: params.quantity });
    }

    updateDetailTextField(type: CartDetailType) {
        this.savingData = true;
        this.cartDetailsSubject.next(type);
    }

    updateDetailDateField(type: CartDetailType) {
        this.savingData = true;
        switch (type) {
            case CartDetailType.realizationDate:
                return this.inCaseUpdateRealizationDate();

            case CartDetailType.paymentDate:
                return this.inCaseUpdatePaymentDate();

            default:
        }
    }

    private inCaseUpdateRealizationDate() {
        if (this.cart.isCartFromQuote) {
            this.cart.updateRealizationDateInCartFromQuote(this.id, this.cart.headerData.receiptDate).then(() => { this.savingData = false; });
            return;
        }

        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.cart.updateRealizationDateXl(this.id, this.cart.headerData.receiptDate).then(() => { this.savingData = false; });
                break;

            case ApplicationType.ForAltum:
                this.cart.updateRealizationDateAltum(this.id, this.cart.headerData.receiptDate).then(() => { this.savingData = false; });
                break;

            default:
                console.error('inCaseUpdateRealizationDate(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
        }
    }

    private inCaseUpdatePaymentDate() {
        if (this.cart.isCartFromQuote) {
            this.cart.updatePaymentDateInCartFromQuote(this.id, this.cart.headerData.dueDate).then(() => { this.savingData = false; });
            return;
        }

        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.cart.updatePaymentDateXl(this.id, this.cart.headerData.dueDate).then(() => {
                    this.cartsService.updateSpecificCart(this.id, this.cart.summaries);
                    this.savingData = false;
                });
                break;

            case ApplicationType.ForAltum:
                this.cart.updatePaymentDateAltum(this.id, this.cart.headerData.dueDate).then(() => { this.savingData = false; });
                break;

            default:
                console.error('inCaseUpdatePaymentDate(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
        }
    }

    updateHeaderAttribute(index, value) {
        this.savingData = true;
        this.attributesSubject.next({ index: index, value: value });
    }

    removeCartItem({ id, no }) {
        this.savingData = true;
        this.configService.loaderSubj.next(true);

        this.cart.removeCartItem(id).then((cartStillExist) => {
            this.updateCartAfterSuccessRemovingCartItems(cartStillExist);
        });
    }

    removeAllUnavailableCartItems() {
        this.savingData = true;
        this.configService.loaderSubj.next(true);

        this.cart.removeAllUnavailableCartItems(this.unavailableCartItems.map(item => item.itemId)).then((cartStillExist) => {
            this.updateCartAfterSuccessRemovingCartItems(cartStillExist);
            this.closeRemoveUnavailableItemsModal();
        });
    }

    private updateCartAfterSuccessRemovingCartItems(cartStillExist: boolean) {
        this.savingData = false;

        if (!cartStillExist) {
            this.cartsService.carts.delete(this.id);
            this.cartsService.recalculateSummary();
            this.commonAvailableCartsService.refreshAvailableCarts();
            //Map refference must be changed to rebind data. Deleting map item doesn't rebind data.
            this.cartsService.carts = new Map(this.cartsService.carts);

            this.router.navigate([this.menuService.routePaths.home]);
            this.configService.loaderSubj.next(false);
            return;
        }

        this.cart.getCartDetails().then(() => {
            this.cartsService.updateSpecificCart(this.cart.cartId, this.cart.summaries);
            this.configService.loaderSubj.next(false);

        }).catch(() => {
            if (!this.configService.isOnline && this.cart.products === undefined) {
                this.message = this.r.translations.noDataInOfflineMode;
            }
            this.configService.loaderSubj.next(false);
        });
    }

    changePage(currentPage) {
        this.configService.loaderSubj.next(true);
        this.cart.changePage(currentPage).then(() => {
            this.configService.loaderSubj.next(false);
        });
    }
    //PG zmiany
    exportOffers() {
        //this.isContactDataEmpty = false;
        try {
            let pdf = new jsPDF('landscape');

            pdf.addFileToVFS("Amiko-Regular.ttf", AmikoNormal);
            pdf.addFont('Amiko-Regular.ttf', 'Amiko', 'normal');
            pdf.addFileToVFS("Amiko-Bold.ttf", AmikoBold);
            pdf.addFont('Amiko-Bold.ttf', 'Amiko', 'bold');
            pdf.setFont("Amiko");

            const headers = [["Nazwa", "Symbol", "EAN", "Cena netto", "Cena brutto", "Ilość", "Wartość netto", "Wartość brutto"]];
            let data = [];

            const companyName: string = this.creditInfo?.customer;
            let height = 20;
            pdf.setFontSize(12)
            pdf.setFont("Amiko", "bold");
            pdf.text("Dane firmy:", 15, height);
            pdf.setFont("Amiko", "normal");
            height += 5;
            pdf.text(this.cart.shippingAddressesXl[0].companyName, 15, height);
            height += 5;
            pdf.text(this.cart.shippingAddressesXl[0].street, 15, height);
            height += 5;
            pdf.text(this.cart.shippingAddressesXl[0].zipCode + " " + this.cart.shippingAddressesXl[0].city, 15, height);
            height += 5;
            pdf.text("tel. " + this.cart.shippingAddressesXl[0].phoneNumber, 15, height);
            if (this.contactData !== "") {
                height = 20;
                pdf.setFontSize(12);
                pdf.setFont("Amiko", "bold");
                pdf.text("Dane klienta:", 240, height);
                pdf.setFont("Amiko", "normal");
                height += 5;
                pdf.text(this.contactData, 240, height);
            }
            pdf.setFontSize(12);
            height += 30;
            const listTitle = "Lista produktów";
            var xOffset = (pdf.internal.pageSize.width || pdf.internal.pageSize.getWidth()) / 2 - (pdf.getStringUnitWidth(listTitle));
            pdf.text(listTitle, xOffset, height);

            let pricesTotalSum: number = 0;
            let pricesSubTotalSum: number = 0;
            this.cart.products.forEach(prod => {
                let totalPrice = 0;
                let subTotalPrice = 0;
                let totalValue = 0;
                let subTotalValue = 0;
                let basicUnit = prod.auxiliaryUnit !== null ?
                    prod.auxiliaryUnit : prod.basicUnit !== null ?
                        prod.basicUnit : prod.unit !== null ?
                            prod.unit : "";

                totalPrice = Number((prod.totalPrice + (prod.totalPrice * this.priceMargin) / 100).toFixed(2));
                subTotalPrice = Number((prod.subtotalPrice + (prod.subtotalPrice * this.priceMargin) / 100).toFixed(2));
                totalValue = totalPrice * prod.quantity.valueOf();
                subTotalValue = subTotalPrice * prod.quantity.valueOf();
                pricesTotalSum += totalValue;
                pricesSubTotalSum += subTotalValue;
                const test = prod.subtotalValue;
                const ean = prod.objectExtension.extendedItemsList[0].value;
                const symbols: string[] = prod.name.split(" ");
                let rowData = [prod.name, symbols[symbols.length - 1], ean, subTotalPrice.toFixed(2) + " PLN", totalPrice.toFixed(2) + " PLN", prod.quantity.valueOf() + " " + basicUnit, subTotalValue.toFixed(2) + " PLN", totalValue.toFixed(2) + " PLN"];
                data.push(rowData);
            });
            data.push(["", "", "", "", "", "   Suma:", `${pricesSubTotalSum.toFixed(2)} PLN`, `${pricesTotalSum.toFixed(2)} PLN`]);

            autoTable(pdf, {
                head: headers,
                body: data,
                startY: height + 3,
                columnStyles: {
                    0: { cellWidth: 95 },
                    1: { cellWidth: 22 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 23 },
                    4: { cellWidth: 23 },
                    5: { cellWidth: 18 },
                    6: { cellWidth: 29 },
                    7: { cellWidth: 29 }
                },
                headStyles: { fillColor: [0, 101, 71] },
                styles: { font: "Amiko", fontSize: 8.5 }
            })
            pdf.save(`Oferta PDF z marżą - ${this.cart.shippingAddressesXl[0].companyName}.pdf`);
        }
        catch (Ex) {
            console.error(Ex.message);
        }
    }
    //PG zmiany k
    addDocument() {
        //PG zmiany p
        if (this.cart.selectedDocumentId == 2) {
            this.exportOffers();
        }
        else {
            //PG zmiany k
            this.message = null;

            this.configService.loaderSubj.next(true);

            return this.cart.addDocument().then((res: b2b.AddDocumentSuccess) => {

                this.configService.loaderSubj.next(false);

                this.cartsService.carts.delete(this.id);

                //Map refference must be changed to rebind data. Deleting map item doesn't rebind data.
                this.cartsService.carts = new Map(this.cartsService.carts);

                this.cartsService.recalculateSummary();

                switch (this.cart.selectedDocumentId) {
                    //there will be more types in the future
                    case CartDocumentType.order:
                        this.router.navigate([this.menuService.routePaths.thankYou, this.id, res.ids.id]);
                        break;

                    case CartDocumentType.inquiry:
                        this.router.navigate([this.menuService.routePaths.inquiries, res.ids.id]);
                        break;
                    default:
                        this.router.navigate([this.menuService.routePaths.home]);
                        break;
                }

                return res;

            }).catch((err: HttpErrorResponse) => {
                if (err.error) {

                    if (typeof err.error === 'string') {
                        this.message = err.error;
                    }
                }

                if (err.error === 406) {
                    this.message = this.r.translations.deliveryMethodOrPaymentFormIsEmpty;
                }

                this.productTableConfig = Object.assign({}, this.productTableConfig);
                this.configService.loaderSubj.next(false);

                if (!this.isCartParamsErrorAfterAddDocument(err.error, err.status)) {
                    UiUtils.scrollToTop();
                }
            });
        }
    }

    changeCart(key: number) {
        this.cart.products = undefined;
        this.router.navigate([this.menuService.routePaths.cart, key]);
    }

    clearErrors() {
        this.message = null;
    }

    /**
     * Fixing wrong validation of native date controls. They doesn't respect min, max and required values for direct input.
     * Validators respected only for datapicker.
     */
    datesInputGuardian(value, dateInputType: 'receiptDate' | 'dueDate') {

        if (!DateHelper.isValid(value, new Date())) {

            if (dateInputType === 'receiptDate') {
                this.receiptDateInput.nativeElement.value = DateHelper.dateToString(this.cart.headerData.receiptDate);
            }

            if (dateInputType === 'dueDate') {
                this.dueDateInput.nativeElement.value = DateHelper.dateToString(this.cart.headerData.dueDate);
            }

            return;
        }


        if (dateInputType === 'receiptDate') {
            this.cart.headerData.receiptDate = new Date(value);
        }

        if (dateInputType === 'dueDate') {
            this.cart.headerData.dueDate = new Date(value);
        }
    }

    checkCart() {
        this.configService.loaderSubj.next(true);
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.cart.checkCartXl().then(() => {
                    this.productTableConfig = Object.assign({}, this.productTableConfig);
                    this.configService.loaderSubj.next(false);
                });
                break;

            case ApplicationType.ForAltum:
                this.cart.checkCartAltum().then(() => {
                    this.productTableConfig = Object.assign({}, this.productTableConfig);
                    this.configService.loaderSubj.next(false);
                });
                break;

            default:
                console.error('checkCart(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
        }
    }

    recalculatePrices() {
        this.configService.loaderSubj.next(true);
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.cart.recalculatePricesXl().then(() => {
                    this.productTableConfig = Object.assign({}, this.productTableConfig);
                    this.configService.loaderSubj.next(false);
                });
                break;

            case ApplicationType.ForAltum:
                this.cart.recalculatePricesAltum().then(() => {
                    this.productTableConfig = Object.assign({}, this.productTableConfig);
                    this.configService.loaderSubj.next(false);
                });
                break;

            default:
                console.error(`recalculatePrices(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    repairQuantities() {
        this.configService.loaderSubj.next(true);
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.cart.repairQuantitiesXl().then(() => {
                    this.productTableConfig = Object.assign({}, this.productTableConfig);
                    this.configService.loaderSubj.next(false);
                });
                break;

            case ApplicationType.ForAltum:
                this.cart.repairQuantitiesAltum().then(() => {
                    this.productTableConfig = Object.assign({}, this.productTableConfig);
                    this.configService.loaderSubj.next(false);
                });
                break;

            default:
                console.error(`repairQuantities(ERROR): Not implemented action for application type: ${this.configService.applicationId}`);
        }
    }

    repairCartHeader() {
        this.configService.loaderSubj.next(true);
        switch (this.configService.applicationId) {
            case ApplicationType.ForXL:
                this.cart.repairCartHeaderXl().then(() => {
                    this.configService.loaderSubj.next(false);
                });
                break;

            case ApplicationType.ForAltum:
                this.cart.repairCartHeaderAltum().then(() => {
                    this.configService.loaderSubj.next(false);
                });
                break;

            default:
                console.error('repairCartHeader(ERROR): Not implemented action for application type: ' + this.configService.applicationId);
        }
    }

    showConfirmModal() {
        this.removeConfirmModal.cart = { cartId: this.cart.cartId, cartName: this.cart.cartName };
        this.removeConfirmModal.visibility = true;
    }

    closeModal() {
        this.removeConfirmModal.cart = undefined;
        this.removeConfirmModal.visibility = false;
    }

    showRemoveUnavailableItemsModal() {
        this.removeUnavailableItemsModal.visibility = true;
    }

    closeRemoveUnavailableItemsModal() {
        this.removeUnavailableItemsModal.visibility = false;
    }

    updateItemDescription(data: b2bShared.UpdateItemDescription) {
        const currentProduct = this.cart.products.find(item => item.itemId === data.itemId);
        if (!currentProduct) {
            return;
        }
        this.savingData = true;
        currentProduct.loading = true;

        if (this.cart.isCartFromQuote) {
            this.cart.updateItemDescriptionInCartFromQuote(data.itemId, data.newDescription).then(() => {
                this.inCaseSuccessUpdateItemDescription(currentProduct);
            });
        } else {
            this.cart.updateItemDescription(data.itemId, data.newDescription).then(() => {
                this.inCaseSuccessUpdateItemDescription(currentProduct);
            });
        }
    }

    private inCaseSuccessUpdateItemDescription(currentProduct: b2b.CartProduct) {
        this.savingData = false;
        currentProduct.loading = false;
        currentProduct.isDescriptionEdited = false;
        this.cart.products = this.cart.products.slice(); //TODO refactor - get product as observable and remove this line
    }

    selectDocument(documentId: CartDocumentType) {
        this.expandedRowVisibility = documentId === 0 ? true : false;//PG zmiana
        this.cart.selectDocument(documentId);
        //PG zmiana - p
        if (documentId === 2) setTimeout(() => { this.scrollToBottom() }, 200);
        //PG zmiana - k
        this.productTableConfig = Object.assign({}, this.productTableConfig, this.cart.productsConfig);
    }
    //PG zmiana - p
    scrollToBottom() {
        const y = document.getElementById("contactData").getBoundingClientRect().top + window.pageYOffset - 160;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
    //PG zmiana - k
    onOpenAddressForm() {
        if (!this.isAddressFormOpened) {
            this.prepareAddressForm(FormMode.AddAnyAddressType);
        }
    }

    onClickEditAddress(addressId: number) {
        const address = this.cart.shippingAddressesXl.find(address => address.addressId === addressId);
        this.prepareAddressForm(FormMode.EditAnyAddressType, address);
    }

    private prepareAddressForm(formMode: FormMode, editModelData: b2bShippingAddress.ShippingAddressXl = null) {
        this.isAddressFormOpened = true;
        const formData = this.prepareAddressFormInputData(formMode, editModelData);
        this.addressFormService.prepareAddressForm(formData);
    }

    private prepareAddressFormInputData(formMode: FormMode, editModelData: b2bShippingAddress.ShippingAddressXl): b2bShippingAddress.AddressFormInitData {
        return { formMode, editModelData, manageManyAddressForms: false };
    }

    onCloseAddressForm() {
        this.isAddressFormOpened = false;
    }

    onSubmitShippingAddress(data: b2bShippingAddress.AddressFormSubmitData) {
        this.savingData = true;
        this.isAddressFormOpened = false;

        if (data.formMode === FormMode.EditAnyAddressType) {
            return this.cart.updateShippingAddresses(data.addressId, data.shippingAddressModel, data.isAddressTemp)
                .then(() => {
                    this.afterSubmitShippingAddress(SaveAddressStatus.EditedSuccessfully);
                })
                .catch(() => {
                    this.afterSubmitShippingAddress(SaveAddressStatus.EditingFailed);
                });
        }

        return this.cart.addShippingAddresses(data.shippingAddressModel, data.isAddressTemp)
            .then(() => {
                this.afterSubmitShippingAddress(SaveAddressStatus.AddedSuccessfully);
            })
            .catch(() => {
                this.afterSubmitShippingAddress(SaveAddressStatus.AddingFailed);
            });
    }

    private afterSubmitShippingAddress(savingAddressStatus: SaveAddressStatus) {
        this.savingData = false;
        this.showSavingAddressStatus(savingAddressStatus);
    }

    showSavingAddressStatus(saveAddressStatus: SaveAddressStatus) {
        const autoHide = saveAddressStatus === SaveAddressStatus.AddedSuccessfully || saveAddressStatus === SaveAddressStatus.EditedSuccessfully;

        const status = {
            isVisible: true,
            autoHide,
            autoHideTimeout: Config.autoHideStatusTimeout,
        } as b2bShared.Status;

        this.addressFormStatus = {
            saveAddressStatus,
            status
        };
    }

    private isCartParamsErrorAfterAddDocument(errorType: any, httpStatus: number): boolean {
        return errorType === AddDocumentErrorType.ValidationError || httpStatus === 409 && !this.cart.isCartHeaderCorrect && !!this.cart.headerValidationSummary;
    }

    getItemId(item: b2b.CartProduct) {
        return item.id;
    }

    ngOnDestroy() {
        this.cart.clearCartDetails();
        this.routeParamsSubscription.unsubscribe();
        this.attributesSubject.unsubscribe();
        this.cartDetailsSubject.unsubscribe();
        this.quantitySubject.unsubscribe();
        this.quantitySub.unsubscribe();
        this.attributesSub.unsubscribe();
        this.cartDetailsSub.unsubscribe();
        this.cartNameChangedSubscription.unsubscribe();
        this.outdatedDetailsChangedSub.unsubscribe();
        this.countriesChangedSubscription.unsubscribe();
        this.addressFormService.clearSelectedAddressesData();
    }
}
