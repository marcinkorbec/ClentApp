import { CyclicityType } from 'src/app/model/enums/cyclicity-type.enum';
import { b2bShared } from './b2b-shared';
import { b2bCommon } from './shared/b2b-common';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bPromotions {

    interface Cyclicity {
        hours: string[];

        /**
         * range of days in a month
         * */
        range: number[];

        type: CyclicityType;

        /**
         * number of repetitions in time (e.g.; number of days; weeks)
         * */
        value: number;

        /**
         * resources with month names or days of the week
         * */
        values: string[];
    }


    //responses


    interface ListItemResponseAltum {
        id: number;
        effectiveFrom: string;
        name: string;
        comment: string;
        type: number;
        until: string;
        extensions: b2bShared.ApiObjectExtension;
    }


    interface ListItemResponseXL extends ListItemResponseAltum {
        cyclicity: Cyclicity | null;
    }

    interface ListItem extends ListItemResponseXL {
        cyclicity?: Cyclicity | null; //XL only
        index?: number; //lazy
        cyclicityInfo?: string[]; //lazy
    }

    interface ListResponseXL {
        promotionList: ListItemResponseXL[];
    }

    interface ListResponseAltum {
        promotionList: ListItemResponseAltum[];
    }

    interface ListResponse {
        promotionList: ListItem[];
    }

    interface PromotionItem {
        id: NUMBER;
        code: string;
        name: string;
        isUnitTotal: NUMBER;
        basicUnit: string;
        defaultUnitNo: NUMBER;
        threshold: NUMBER;
        type: NUMBER;
        promotionPositionType: NUMBER;
        value: string;
        vatDirection: string;
        currency: string;
        image: b2bShared.ImageBase;
        auxiliaryUnit: string;
        denominator: NUMBER;
        numerator: NUMBER;
        discountAllowed: boolean;
        itemExistsInCurrentPriceList: boolean;
        attributes: b2bShared.PositionAttribute[];
        extensions: b2bShared.ApiObjectExtension;
        unitLockChange: boolean;
        units?: Map<number, UnitMapElement>;
        unitsLoaded?: boolean;
    }

    interface PromotionItemUI extends PromotionItem {
        quantity?: number;
        cartId?: number;
        unitId?: number;
        status?: ProductStatus.unavaliable;
        converter?: string;
        imageHeight?: number;
        imageWidth?: number;
    }

    interface DetailsResponseBase {
        paging: b2bDocuments.PaginationConfig;
        promotionAttachments: b2bShared.Attachment[];
    }

    interface DetailsResponseAltum extends DetailsResponseBase {
        promotionItems: PromotionItem[];
    }

    interface DetailsResponseXL extends DetailsResponseBase {
        promotionItems: PromotionItem[];
        warehouse: b2bShared.AddProductToWarehouse;
    }

    interface DetailsResponseUnified extends DetailsResponseBase {
        promotionItems: PromotionItemUnified[];
        warehouse?: b2bShared.AddProductToWarehouse; //XL only
    }

}
