import { Component, OnInit, ViewEncapsulation, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { ResourcesService } from '../../model/resources.service';
import { b2b } from '../../../b2b';
import { MenuService } from '../../model/menu.service';
import { ConfigService } from '../../model/config.service';
import { GroupsService } from 'src/app/model/groups/groups.service';
import { SplitPipe } from 'src/app/helpers/pipes/split-prod-name';

@Component({
    selector: 'app-groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss'],
    host: { class: 'app-groups' },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsComponent implements OnInit, OnChanges {

    r: ResourcesService;

    @Input()
    isProductsPage: boolean;

    @Input()
    groupId: number;

    @Input()
    parentId?: number;

    articlesMenuItem: b2b.MenuItem;

    barExceptItems: b2b.MenuItem[];

    constructor(
        resourcesService: ResourcesService,
        public groupsService: GroupsService,
        public menuService: MenuService,
        private changeDetector: ChangeDetectorRef,
        public configService: ConfigService
    ) {
        this.r = resourcesService;
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (!('groupId' in changes) || parseInt(changes.groupId.currentValue, 10) === this.groupsService.currentGroup?.id) {
            return;
        }

        let parentId: number;

        if (!('parentId' in changes)) {
            parentId = null;
        } else {
            parentId = parseInt(changes.parentId.currentValue, 10);
            parentId = parentId !== NaN ? parentId : this.groupsService.parentGroup?.id;
        }

        this.goToGroup(changes.groupId.currentValue, parentId);

    }

    ngOnInit() {
        window.setTimeout(() => { this.changeDetector.markForCheck(); }, 0);

        this.menuService.loadFullMenuItems().then((fullItems) => {
            this.articlesMenuItem = fullItems.find(item => item.url === this.menuService.routePaths.items);
            this.barExceptItems = this.menuService.defaultMenuItems.filter(item => item.url !== this.menuService.routePaths.items);
            window.setTimeout(() => { this.changeDetector.markForCheck(); }, 0);
        });
    }

    backToPreviousGroup() {
        this.groupsService.backToPreviousGroup().subscribe(() => {
            window.setTimeout(() => { this.changeDetector.markForCheck(); }, 0);
        });
    }

    goToRoot() {
        this.groupsService.goToRoot().subscribe(() => {
            window.setTimeout(() => { this.changeDetector.markForCheck(); }, 0);
        });
    }

    scrollToGroup(groupId = 0, parentId = null) {
        this.groupsService.scrollToGroup(groupId, parentId).subscribe(() => {
            window.setTimeout(() => { this.changeDetector.markForCheck(); }, 0);
        });
    }

    goToGroup(groupId = 0, parentId = null) {
        this.groupsService.goToGroup(groupId, parentId).subscribe(() => {
            window.setTimeout(() => { this.changeDetector.markForCheck(); }, 0);
        });
    }

    isRootButton() {
        return this.groupsService.history.length > 2;
    }

    isBackButton() {
        return this.groupsService.history.length > 1 && !(this.groupsService.isAnyActive && this.groupsService.history.length === 2);
    }

}
