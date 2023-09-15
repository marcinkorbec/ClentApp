import { b2bShared } from 'src/integration/b2b-shared';
import { QuantityDisplayType } from 'src/app/model/shared/enums/quantity-display-type.enum';

export module b2bArticleGrid {

    interface GridArticle {
        article: b2bShared.ArticleBase;
        unit?: b2bShared.ArticleUnits;
        quantity?: b2bShared.Quantity;
        itemId: number;
        attributes?: b2bShared.PositionAttribute[];
        selected?: boolean;
    }

    interface GridArticleSummary {
        count?: number;
    }

    interface GridArticleConfig {
        showCode?: boolean;
        showItemsSelection?: boolean;
        showRemoveButtons?: boolean;
        quantityDisplayType?: QuantityDisplayType;
        allItemsSelected?: boolean;
        allItemsSelectedByUser?: boolean;
    }

    interface ChangeItemQuantity {
        itemId: number;
        quantityValue: number;
    }

    interface GridArticleSelection {
        itemId: number;
        isSelected: boolean;
    }
}
