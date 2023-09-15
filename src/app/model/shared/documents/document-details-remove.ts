import { Observable } from 'rxjs';


export interface DocumentDetailsRemove {

    id: number;
    remove(): Observable<boolean>;
}
