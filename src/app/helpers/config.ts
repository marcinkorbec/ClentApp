import { b2bShared } from 'src/integration/b2b-shared';
import { ImageType } from '../model/shared/enums/image-type.enum';

export class Config {

    static readonly createNewCartId: number = -1;
    static readonly createNewStoreId: number = -1;
    static readonly maxCartNameLength: number = 20;
    static readonly autoCloseAddToCartModalTimeout: number = 1500;
    static readonly autoCloseFilterSetModalTimeout: number = 2500;
    static readonly autoCloseProductVariantsNotificationsModalTimeout: number = 2000;

    static readonly pageNumberToGetAfterRemoveAllUnavailableCartItems: number = 1;
    static readonly maxDescriptionLength: number = 2000;
    static readonly collapsedDescriptionLength: number = 100;

    static readonly autoHideStatusTimeout: number = 4000;
    static readonly emailRegexString: RegExp = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w{2,}$/;

    static readonly defaultArticleListImageHeight: number = 320;
    static readonly defaultArticleListImageWidth: number = 320;

    static readonly defaultArticleDetailsImageHeight: number = 400;
    static readonly defaultArticleDetailsImageWidth: number = 400;

    static readonly defaultArticleReplacementImageHeight: number = 300;
    static readonly defaultArticleReplacementImageWidth: number = 300;

    static readonly defaultArticleTableItemImageHeight: number = 50;
    static readonly defaultArticleTableItemImageWidth: number = 50;

    static readonly defaultArticleComplaintFormImageHeight: number = 250;
    static readonly defaultArticleComplaintFormImageWidth: number = 250;

    static readonly defaultSupervisorImageHeight: number = 100;
    static readonly defaultSupervisorImageWidth: number = 100;

    static readonly notFoundIndex: number = -1;
    static readonly commonFilterValueIdPropertyName: string = 'id';
    static readonly commonSelectedFilterValuePropertyName: string = 'selectedValue';
    static readonly commonSelectedFilterValueToShowPropertyName: string = 'selectedValueToShow';
    static readonly profileAddShippingAddressFormName: string = 'addShippingAddress';

    static readonly filterSetMinLengthToShowTooltip: number = 36;
    static readonly maxFilterSetNameLength: number = 255;
    static readonly numberOfFilterSetsVisibleByDefault: number = 5;
    static readonly filterSetClearCacheRequestName: string = '/api/items/filterSet';

    static readonly productVariantPropertyIdKey: string = 'propertyId';
    static readonly productVariantValueIdKey: string = 'valueId';
    static readonly productVariantPropertiesKey: string = 'properties';


    static getImageHandlerSrc(imageId: number, width?: number, height?: number): string {
        return `/imagehandler.ashx?id=${imageId}&width=${width ? width : 50}&height=${height ? height : 50}`;
    }

    static getFileHandlerSrc(id: number, fileName: string, customerData: string): string {
        return `/filehandler.ashx?id=${id}&fileName=${fileName}&customerData=${customerData}`;
    }

    static getImageSrc(image: b2bShared.ImageBase, width?: number, height?: number): string {
        switch (image.imageType) {
            case ImageType.FromBinary:
                return Config.getImageHandlerSrc(image.imageId, width, height);
            case ImageType.FromUrl:
                return image.imageUrl;
            default:
                return null;
        }
    }
}
