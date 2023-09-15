import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { b2bProductDetails } from 'src/integration/b2b-product-details';

@Component({
    selector: 'app-product-planned-deliveries',
    templateUrl: './product-planned-deliveries.component.html',
    styleUrls: ['./product-planned-deliveries.component.scss'],
    host: { 'class': 'app-product-planned-deliveries' },
    encapsulation: ViewEncapsulation.None,
})
export class ProductPlannedDeliveriesComponent implements OnInit {

    @Input()
    translations: any;

    @Input()
    plannedDeliveries: b2bProductDetails.PlannedDelivery[];

    @Input()
    productName: string;

    @Input()
    productCode: string;

    @Input()
    hasAccessToPlannedDeliveries: boolean;

    constructor() { }

    ngOnInit() {
    }

}
