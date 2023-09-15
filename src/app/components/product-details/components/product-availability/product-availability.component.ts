import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { b2bProductDetails } from 'src/integration/b2b-product-details';

@Component({
    selector: 'app-product-availability',
    templateUrl: './product-availability.component.html',
    styleUrls: ['./product-availability.component.scss'],
    host: { 'class': 'app-product-availability' },
    encapsulation: ViewEncapsulation.None,
})
export class ProductAvailabilityComponent implements OnInit {

    @Input()
    translations: any;

    @Input()
    details: b2bProductDetails.ProductAvailabilityDetails;

    constructor() { }

    ngOnInit() { }
}
