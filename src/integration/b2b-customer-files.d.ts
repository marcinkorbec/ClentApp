import { b2bCommon } from "./shared/b2b-common";
import { b2bShared } from 'src/integration/b2b-shared';
import { b2bDocuments } from './shared/b2b-documents';

export module b2bCustomerFiles {

    export interface ListRequest {
        creationDate: string;
        modificationDate: string;
        fileName: string;
    }
    
    export interface FilteringOptions {
        creationDate: string;
        modificationDate: string;
        fileName: string;
    }

    //response

    export interface ListItemResponse extends b2bShared.AttachmentViewModel, b2bDocuments.ListItemBase {
        creationTime?: string;
        modificationTime?: string;
    }

    export type ListResponse = ListItemResponse[];

    export interface ListResponseUnified {
        customerFiles: ListItemResponse[];
    }

}