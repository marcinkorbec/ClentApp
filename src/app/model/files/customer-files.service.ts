import { Injectable } from '@angular/core';
import { b2b } from 'src/b2b';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { b2bShared } from 'src/integration/b2b-shared';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { AttachmentType } from '../shared/enums/attachment-type.enum';
import { TargetLinkType } from '../shared/enums/target-link-type.enum';
import { Config } from 'src/app/helpers/config';
import { BasicItemsList } from '../shared/documents/basic-items-list';
import { b2bCustomerFiles } from 'src/integration/b2b-customer-files';
import { Observable } from 'rxjs';
import { MenuService } from '../menu.service';
import { AccountService } from '../account.service';
import { ERPService } from '../shared/erp/erp.service';
import { tap } from 'rxjs/operators';


@Injectable()
export class CustomerFilesService extends BasicItemsList<b2bCustomerFiles.ListItemResponse, b2bCustomerFiles.FilteringOptions, b2bCustomerFiles.ListResponseUnified> {
    
    emptyListMessage: b2bDocuments.EmptyListInfo;
    columns: b2bDocuments.ColumnConfig[];

    constructor(httpClient: HttpClient, menuService: MenuService, accountService: AccountService, private ERPService: ERPService) {

        super(httpClient, menuService, accountService);

        this.emptyListMessage = { resx: 'noFiles', svgId: 'Files' };
        this.listResponseProperty = 'customerFiles';

        this.columns = [
            {
                property: 'fullName',
                translation: 'fileName',
                type: 'fileName',
                mobileVisibleColumn: true,
                fileExtensionProperty: 'extension',
                filter: { property: 'fileName', type: 'text' }
            },
            {
                property: 'creationDate',
                translation: 'creationDate',
                mobileVisibleColumn: true,
                filter: { property: 'creationDate', type: 'date' },
            },
            {
                property: 'modificationDate',
                translation: 'modificationDate',
                mobileVisibleColumn: true,
                filter: { property: 'modificationDate', type: 'date' },
            },
            {
                translation: 'filesToDownload', 
                type: 'linkedDocument', 
                mobileVisibleColumn: true,
                mobileHiddenHeader: true,
                link: {
                    type: 'href',
                    hrefCreator: this.hrefCreator,
                    targetCreator: this.targetCreator,
                    labelResource: 'downloadFile',
                    labelIcon: 'ti-download'
                }
            },
        ];

        this.gridTemplateColumnsMobile = `repeat(${this.columns.length}, 1fr)`;
    }

    loadList() {

        return super.loadList().pipe(tap(res => {
            this.items = res.customerFiles.map(file => {
                //TODO temp solution - problem with CSS styles and !important
                file.creationTime = file.creationTime;
                file.modificationTime = file.modificationTime;
                return file;
            });

            return Object.assign({}, this.items);
        }));
    }

    hrefCreator(item: b2bShared.CustomerFile) {
        if (!item) {
            return null;
        }

        switch (item.type) {
            case AttachmentType.FromBinary:
                return Config.getFileHandlerSrc(item.id, item.fullName, item.hash);
            case AttachmentType.FromUrl:
                return item.url;
            default:
                return null;
        }
    }

    getDocumentRouterLink(item: b2bCustomerFiles.ListItemResponse) {
        if (!item) {
            return '';
        }

        switch (item.type) {
            case AttachmentType.FromBinary:
                return Config.getFileHandlerSrc(item.id, item.fullName, item.hash);
            case AttachmentType.FromUrl:
                return item.url;
            default:
                return item.url;
        }
    }

    targetCreator(item: b2bShared.CustomerFile) {
        if (!item) {
            return null;
        }

        switch (item.type) {
        case AttachmentType.FromBinary:
            return TargetLinkType.Self;
        case AttachmentType.FromUrl:
            return TargetLinkType.Blank;
        default:
            return null;
        }
    }


    protected getDefaultFilteringOptions(): b2bCustomerFiles.FilteringOptions {
        return {
            creationDate: null,
            modificationDate: null,
            fileName: null
        };
    }

    protected requestList(): Observable<b2bCustomerFiles.ListResponseUnified> {
        const params = {
            fileName: this.currentFilter.fileName || '',
            creationDate: this.currentFilter.creationDate || '',
            modificationDate: this.currentFilter.modificationDate || '',
        };

        return this.ERPService.context.customerFiles.list(params);
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this;
    }
}
