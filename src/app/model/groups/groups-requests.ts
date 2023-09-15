import { Observable } from "rxjs";
import { b2bShared } from "src/integration/b2b-shared";

export interface GroupsRequests {

    requestTree(groupId: number, parentId?: number): Observable<b2bShared.GetTreeResponse>;
}
