import { Observable } from 'rxjs/internal/Observable';

export interface DocumentDetailsWithType<response> {

    id: number;
    type: number;
    loadDetails(id: number, type: number): Observable<response>;
}
