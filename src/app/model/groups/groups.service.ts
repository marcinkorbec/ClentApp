import { Injectable } from '@angular/core';
import { Subscription, BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { b2b } from 'src/b2b';
import { AccountService } from '../account.service';
import { ERPService } from '../shared/erp/erp.service';
import { tap } from 'rxjs/operators';
import { b2bShared } from 'src/integration/b2b-shared';


@Injectable({
    providedIn: 'root'
})
export class GroupsService {

    rootGroupId: number;

    parentGroup: b2bShared.TreeParentGroup;
    currentGroup: b2bShared.TreeParentGroup;
    lastChangedGroup: b2bShared.TreeParentGroup;
    grandParentId: number;

    childGroups: b2b.Group[];
    history: b2b.Breadcrumb[];
    isAnyActive: boolean;

    private groupChanged: BehaviorSubject<b2bShared.TreeGroupModalData>;
    groupChanged$: Observable<b2bShared.TreeGroupModalData>;

    private groupsScrolled: BehaviorSubject<b2bShared.TreeGroupModalData>;
    groupsScrolled$: Observable<b2bShared.TreeGroupModalData>;

    logOutSub: Subscription;

    constructor(
        private accountService: AccountService,
        private erpService: ERPService
    ) {

        this.setInitialData();

        this.groupChanged = new BehaviorSubject<b2bShared.TreeGroupModalData>(null);
        this.groupChanged$ = this.groupChanged.asObservable();
        this.groupsScrolled = new BehaviorSubject<b2bShared.TreeGroupModalData>(null);
        this.groupsScrolled$ = this.groupsScrolled.asObservable();

        this.logOutSub = this.accountService.logOutSubj.subscribe(() => {
            this.setInitialData();
        });
    }


    setInitialData() {
        this.rootGroupId = 0;
        this.childGroups = [];
        this.history = [{ 'id': 0, 'name': '' }];
        this.isAnyActive = undefined;
    }

    private loadGroup(groupId: number, parentId: number = null) {
        if (this.currentGroup && this.currentGroup.id === groupId) {
            return EMPTY;
        }

        return this.erpService.context.groups.requestTree(groupId, parentId).pipe(
            tap(res => {
                this.currentGroup = res.parentGroups[res.parentGroups.length - 1];
                this.parentGroup = res.parentGroups[res.parentGroups.length - 2] || null;
                this.childGroups = res.groups;
                this.history = res.parentGroups;
                const grandParentGroup = res.parentGroups[res.parentGroups.length - 3] || null;
                this.grandParentId = grandParentGroup ? grandParentGroup.id : null;

                this.isAnyActive = !!this.childGroups.find(item => item.id === this.currentGroup.id);

                if (!this.rootGroupId) {
                    this.rootGroupId = res.parentGroups[0].id;
                }

                return res;
            }));
    }

    goToGroup(groupId: number, parentId: number = null) {
        return this.loadGroup(groupId, parentId).pipe(
            tap(() => {
                this.lastChangedGroup = this.prepareCurrentGroupCopy();
                const data = this.prepareTreeGroupModalData();
                this.groupChanged.next(data);
            })
        );
    }

    private prepareCurrentGroupCopy() {
        return { ...this.currentGroup };
    }

    scrollToGroup(groupId: number, parentId: number = null) {
        return this.loadGroup(groupId, parentId).pipe(
            tap(() => {
                const data = this.prepareTreeGroupModalData();
                this.groupsScrolled.next(data);
            })
        );
    }

    private prepareTreeGroupModalData(): b2bShared.TreeGroupModalData {
        return {
            id: this.currentGroup.id,
            history: this.history,
        };
    }


    backToPreviousGroup() {
        if (this.isAnyActive) {
            const grandGrandParent = this.history[this.history.length - 3];
            const grandGrandParentId = grandGrandParent ? grandGrandParent.id : null;
            return this.scrollToGroup(this.grandParentId, grandGrandParentId);
        } else {
            return this.scrollToGroup(this.parentGroup.id, this.grandParentId);
        }
    }

    goToRoot() {
        return this.scrollToGroup(this.rootGroupId);
    }
}
