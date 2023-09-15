import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { b2bProductDetails } from 'src/integration/b2b-product-details';

@Component({
    selector: 'app-product-last-order-details',
    templateUrl: './product-last-order-details.component.html',
    styleUrls: ['./product-last-order-details.component.scss'],
    host: { 'class': 'app-product-last-order-details' },
    encapsulation: ViewEncapsulation.None,
})
export class ProductLastOrderDetailsComponent implements OnInit {

    @Input()
    translations: any;

    @Input()
    lastOrderDetails: b2bProductDetails.LastOrderDetails;

    @Input()
    hasAccessToPriceList: boolean;

    @Input()
    orderRoutePath: string;

    constructor() { }

    ngOnInit() { }
}
