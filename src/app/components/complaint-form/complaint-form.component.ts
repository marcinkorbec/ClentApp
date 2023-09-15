import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResourcesService } from '../../model/resources.service';
import { b2b } from '../../../b2b';
import { ConfigService } from '../../model/config.service';
import { MenuService } from 'src/app/model/menu.service';
import { SourceDocumentNumberType } from '../../model/shared/enums/source-document-number-type.enum';
import { ComplaintFormService } from 'src/app/model/complaints/complaint-form.service';
import { b2bComplaints } from 'src/integration/b2b-complaints';


@Component({
    selector: 'app-complaint-form',
    templateUrl: './complaint-form.component.html',
    styleUrls: ['./complaint-form.component.scss'],
    host: { class: 'app-complaint-form' },
    providers: [ComplaintFormService],
    encapsulation: ViewEncapsulation.None
})
export class ComplaintFormComponent implements OnInit, OnDestroy {

    complaintFormService: ComplaintFormService;
    activatedRouteSub: Subscription;
    r: ResourcesService;
    private requestsLoaded: boolean;
    noteFormDisplay: boolean;
    backMenuItem: b2b.MenuItem;
    //PG zmiany p
    complaintsReasons: b2b.ComplaintReason[];
    repairTypesList: b2b.RepairType[];
    //repairTypeSelected:
    selectRepairType: string;
    selectRepairTypeName: string;
    isChecked: boolean;
    isTooLongReasonDescription: boolean;
    selectedFile: File;
    selectedProductFile: File;
    convertedText: string;
    complaintData: string = null;
    additionalData:string = "";
    productImagePath:string = "";
    productsCategories: b2b.CategoriesHomePage[];
    //PG zmiany k

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        resourcesService: ResourcesService,
        public configService: ConfigService,
        private menuService: MenuService,
        complaintFormService: ComplaintFormService,

    ) {

        this.r = resourcesService;
        this.complaintFormService = complaintFormService;
        this.selectRepairType = 'true';
        this.selectRepairTypeName = "Gwarancyjna";

    }

    ngOnInit() {
        this.configService.loaderSubj.next(true);

        this.backMenuItem = {
            resourceKey: 'backToList',
            cssClass: 'back',
            url: '/profile/payments',
            position: 0
        };

        this.activatedRouteSub = this.activatedRoute.params.subscribe(res => {

            this.configService.loaderSubj.next(true);

            const splittedParams = (res.itemsComplaint as b2bComplaints.complaintParamString).split(':');
            const itemId = Number.parseInt(splittedParams[0], 10);
            const sourceDocumentId = Number.parseInt(splittedParams[1], 10);
            const no = Number.parseInt(splittedParams[2], 10);

            this.complaintFormService.loadProducts(itemId, sourceDocumentId, no).subscribe(() => {
                this.configService.loaderSubj.next(false);
            });
        });

        this.complaintsReasons = [
            {
                id:0,
                name:"Wybierz z listy"
            },
            {
                id:1,
                name:"Niepoprawne działanie"
            },
            {
                id:2,
                name:"Niekompletne opakowanie"
            },
            {
                id:3,
                name:"Przedsprzedaż"
            },
            {
                id:4,
                name:"Uszkodzenie mechaniczne"
            },
            {
                id:5,
                name:"Inne"
            },
        ]

        this.repairTypesList = [
            {
                id:0,
                value: 'true',
                name:"Gwarancyjna"
            },
            {
                id:1,
                value: 'false',
                name:"Pogwarancyjna"
            },
        ];
        this.productsCategories = [
            {
                id: 0,
                header: "Narzędzia ręczne",
                buttonURL: "/items/55806?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/1.Narzedzia_Reczne_n.jpg",
                imageAlt: "narzedzia-reczne"
            },
            {
                id: 1,
                header: "Wyposażenie",
                buttonURL: "/items/55807?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/10.Wyposazenie_n.jpg",
                imageAlt: "wyposazenie"
            },
            {
                id: 2,
                header: "Narzędzia budowlane",
                buttonURL: "/items/55808?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/8.Narzedzia_budowlane_n.jpg",
                imageAlt: "narzedzia-budowlane"
            },
            {
                id: 3,
                header: "Akcesoria malarskie",
                buttonURL: "/items/55809?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/7.Akcesoria_malarskie_n.jpg",
                imageAlt: "akcesoria-malarskie"
            },
            {
                id: 4,
                header: "Elektronarzędzia",
                buttonURL: "/items/55810?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/4.Elektroanrzedzia_n.jpg",
                imageAlt: "elektronarzedzia"
            },
            {
                id: 5,
                header: "Osprzęt do elektronarzędzi",
                buttonURL: "/items/55811?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/3.Osprzet_do_elektronarzedzi_n.jpg",
                imageAlt: "osprzet-do-elektronarzedzi"
            },
            {
                id: 6,
                header: "Systemy zamocowań",
                buttonURL: "/items/55812?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/2.Systemy_Mocowan_n.jpg",
                imageAlt: "systemy-zamocowań"
            },
            {
                id: 7,
                header: "Chemia techniczna i budowlana",
                buttonURL: "/items/55813?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/9.Chemia_techniczna_n.jpg",
                imageAlt: "chemia-techniczna"
            },
            {
                id: 8,
                header: "Odzież i akcesoria BHP",
                buttonURL: "/items/55814?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/6.Odziez_i_akcesoria_BHP_n.jpg",
                imageAlt: "odziez-i-akcesoria-bhp"
            },
            {
                id: 9,
                header: "Narzędzia ogrodnicze",
                buttonURL: "/items/55815?parent=0",
                imageSrc: "/ClientApp/assets/images/main-page/categories/5.Narzedzia_ogrodowe_n.jpg",
                imageAlt: "narzedzia-ogrodnicze"
            },
        ];
    }

    onFileSelected(event: any){
        this.selectedFile = event.target.files[0];
    }

    onProductFileSelected(event: any){
        this.selectedProductFile = event.target.files[0];
    }

    loadRequests() {
        if (!this.requestsLoaded) {
            this.complaintFormService.loadRequests().subscribe(() => {
                this.requestsLoaded = true;
            });

        }
    }

    changeQuantity(quantity) {
        this.complaintFormService.item.basicQuantity = quantity;
    }

    changeNoteDisplay() {
        this.noteFormDisplay = !this.noteFormDisplay;
    }

    onRepairTypeChange(repairType){
        this.selectRepairType = repairType.value;
        this.selectRepairTypeName = repairType.name;
    }

    complain(data) {
        this.complaintData = "";
        if(data.reason.length > 2000) this.isTooLongReasonDescription = true;
        else
        {
            console.log(data.productsCategories);

            if(data.productsCategories == "Elektronarzędzia"){
                this.additionalData = `
                    Numer seryjny urządzenia: ${data.deviceSerialNumber} <br/>
                    Numer karty gwarancyjnej: ${data.warrantyCardNumber} <br/>
                `
            }
            else{
                this.productImagePath = `Zdjęcie produktu(zdjęcie): www.ftpServer/reklamacje/${this.selectedProductFile.name} <br/>`
            }
            if(this.selectRepairTypeName === "Gwarancyjna")
            {
                this.complaintData =
                `
                Naprawa: ${this.selectRepairTypeName} <br/>
                ${this.additionalData}
                Adres: ${data.contactAddress} <br/>
                Email: ${data.email} <br/>
                Tel: ${data.sourceNumber} <br/>
                Dowód zakupu(zdjęcie): www.ftpServer/reklamacje/${this.selectedFile.name} <br/>
                Przyczyna: ${data.complaintsReasons} <br/>
                Dodatkowe szczegóły: ${data.reason} <br/>
                ${this.productImagePath}
                `
            }
            else
            {
                this.complaintData =
                `
                Naprawa: ${this.selectRepairTypeName} <br/>
                Email: ${data.email} <br/>
                Tel: ${data.sourceNumber} <br/>
                Przyczyna: ${data.complaintsReasons} <br/>
                Dodatkowe szczegóły: ${data.reason} <br/>
                ${this.productImagePath}
                `
            }
            const params: b2bComplaints.ComplainParameters = {
                SourceNumber: data.sourceNumber,
                //Description: data.description,
                Description: this.complaintData,
                SourceDocumentTypeId: this.complaintFormService.item.sourceDocumentType,
                SourceDocumentId: this.complaintFormService.item.sourceDocumentId,
                SourceDocumentNo: this.complaintFormService.no,
                Quantity: this.complaintFormService.item.basicQuantity,
                Reason: data.complaintsReasons,
                //Request: data.request,
                Request: 1,
                AdditionalInformation: data.additionalInformation,
                ArticleId: this.complaintFormService.item.itemId
            }

            this.complaintFormService.complain(params).subscribe(res => {
                this.router.navigate([this.menuService.routePaths.complaints, res.set1[0].id]);
            });
        }
    }
    // async convertBinaryToText(){
    //     if (this.selectedFile) {
    //         const convertedText = await this.readFileAsDataURL(this.selectedFile);
    //         this.convertedText = convertedText;
    //     }
    // }

    // private readFileAsDataURL(file: File): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //       const reader = new FileReader();
    //       reader.onload = (event: any) => {
    //         resolve(event.target.result);
    //       };
    //       reader.onerror = (event: any) => {
    //         reject(event.error);
    //       };
    //       reader.readAsDataURL(file);
    //     });
    // }

    closeTooLongReasonDescriptionModal(){
        this.isTooLongReasonDescription = false;
    }
    hrefCreator(complaintFormProduct: b2b.ComplaintFormProduct) {
        switch (complaintFormProduct.sourceDocumentType) {
            case SourceDocumentNumberType.FS:
            case SourceDocumentNumberType.PA:
                return `${this.menuService.routePaths.paymentDetails}/${complaintFormProduct.sourceDocumentId}/${complaintFormProduct.sourceDocumentType}`;
            default:
                return null;
        }
    }

    ngOnDestroy(): void {
        this.activatedRouteSub.unsubscribe();
    }
}
