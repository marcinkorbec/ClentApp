import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Pagination } from '../../model/shared/pagination';
import { ResourcesService } from '../../model/resources.service';
import { ConfigService } from '../../model/config.service';
import { MenuService } from '../../model/menu.service';
import { b2bArticleGrid } from 'src/integration/shared/b2b-article-grid';
import { SelectionType } from '../../model/shared/enums/selection-type.enum';
import { Config } from '../../helpers/config';

@Component({
    selector: 'app-article-grid',
    templateUrl: './article-grid.component.html',
    styleUrls: ['./article-grid.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'app-article-grid' },
})
export class ArticleGridComponent implements OnInit {

    @Input()
    items: b2bArticleGrid.GridArticle[];

    @Input()
    summary: b2bArticleGrid.GridArticleSummary;

    @Input()
    config: b2bArticleGrid.GridArticleConfig;

    @Input()
    pagination: Pagination;

    @Output()
    changePage: EventEmitter<number>;

    @Output()
    changeItemQuantity: EventEmitter<b2bArticleGrid.ChangeItemQuantity>;

    @Output()
    removeItem: EventEmitter<number>;

    @Output()
    selectAllItemsChanged: EventEmitter<SelectionType>;

    @Output()
    singleItemSelectionChanged: EventEmitter<b2bArticleGrid.GridArticleSelection>;

    articleItemImageHeight: number;
    articleItemImageWidth: number;

    constructor(
        public r: ResourcesService,
        public configService: ConfigService,
        public menuService: MenuService) {

        this.changePage = new EventEmitter<number>();
        this.changeItemQuantity = new EventEmitter<b2bArticleGrid.ChangeItemQuantity>();
        this.removeItem = new EventEmitter<number>();
        this.selectAllItemsChanged = new EventEmitter<SelectionType>();
        this.singleItemSelectionChanged = new EventEmitter<b2bArticleGrid.GridArticleSelection>();

        this.articleItemImageHeight = Config.defaultArticleTableItemImageHeight;
        this.articleItemImageWidth = Config.defaultArticleTableItemImageWidth;
    }

    ngOnInit() {}

    trackByFn(i, el) {
        return el.itemId || i;
    }

    changeQuantityMiddleware(itemId: number, quantityValue: number) {
        this.changeItemQuantity.emit({ itemId, quantityValue });
    }

    changePageMiddleware(value: number) {
        this.changePage.emit(value);
    }

    removeItemMiddleware(itemId: number) {
        this.removeItem.emit(itemId);
    }

    onClickSelectAll(selectAll: boolean) {
        const selectionType = selectAll ? SelectionType.All : SelectionType.None;
        this.selectAllItemsChanged.emit(selectionType);
    }

    onClickSelectItem(itemId: number, isSelected: boolean) {
        this.singleItemSelectionChanged.emit({itemId, isSelected});
    }
}
