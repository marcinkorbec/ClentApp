import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { b2bCommon } from 'src/integration/shared/b2b-common';

@Injectable({
    providedIn: 'root'
})
export class CommonRequestsService {

    constructor(private httpClient: HttpClient) { }

    getGlobalFiltersXlRequest(): Observable<b2bCommon.GetGlobalFiltersXlResponse> {
        return this.httpClient.get<b2bCommon.GetGlobalFiltersXlResponse>('/api/common/globalFiltersXl');
    }

    getGlobalFiltersAltumRequest(): Observable<b2bCommon.GetGlobalFiltersAltumResponse> {
        return this.httpClient.get<b2bCommon.GetGlobalFiltersAltumResponse>('/api/common/globalFiltersAltum');
    }
}
