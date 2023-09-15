import { Component, OnInit, ViewEncapsulation, EventEmitter, Output, Input } from '@angular/core';
import { b2bShared } from 'src/integration/b2b-shared';
import { ImageType } from '../../model/shared/enums/image-type.enum';
import { Config } from '../../helpers/config';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'app-image' },
})
export class ImageComponent implements OnInit {

    private _imageData: b2bShared.ImageBase;

    imageSrc: string;
    loading: boolean;
    private wasLoaded: boolean;

    @Input()
    set imageData(imageData: b2bShared.ImageBase) {
        this._imageData = imageData;
        this.initImage(this._imageData);
    }

    @Input()
    alt: string;

    @Input()
    width: number;

    @Input()
    height: number;

    @Output()
    loaded: EventEmitter<void>;

    constructor() {
        this.loaded = new EventEmitter<void>();
    }

    ngOnInit() {
        if (!this.width) {
            this.width = 100;
        }

        if (!this.height) {
            this.height = 100;
        }
    }

    private initImage(imageData: b2bShared.ImageBase) {

        if (!imageData || !imageData.imageType) {
            this.resetImageData();
            return;
        }

        switch (imageData.imageType) {
            case ImageType.FromBinary:
                this.imageSrc = Config.getImageHandlerSrc(imageData.imageId, this.width, this.height);
                this.loading = !this.wasLoaded;
                break;
            case ImageType.FromUrl:
                this.imageSrc = imageData.imageUrl;
                this.loading = !this.wasLoaded;
                break;
            default:
                this.resetImageData();
        }
    }

    private resetImageData() {
        this.imageSrc = null;
        this.loading = false;
    }

    afterImageLoading() {
        this.loading = false;
        this.wasLoaded = true;
        this.loaded.emit();
    }

    errorWhileLoadingImage() {
        this.resetImageData();
    }
}
