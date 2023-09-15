import { HttpClient } from "@angular/common/http";
import { b2bShared } from "src/integration/b2b-shared";
import { GroupsRequests } from "./groups-requests";

export class GroupsAltumRequests implements GroupsRequests{


    constructor(private httpClient: HttpClient) {}

    requestTree(groupId: number, parentId?: number) {

        const convertedParentId = Number.isInteger(parentId) ? parentId : '';
        return this.httpClient.get<b2bShared.GetTreeResponse>(`/api/items/treeAltum/${groupId}?parentId=${convertedParentId}`);
    }
}
