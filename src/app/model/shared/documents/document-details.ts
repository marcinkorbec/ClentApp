import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { tap } from 'rxjs/operators';
import { b2bDocuments } from 'src/integration/shared/b2b-documents';
import { ConfigService } from '../../config.service';
import { PrintHandlerService } from '../printhandler.service';
import { DocumentDetailsBase } from './document-details-base';
import { DocumentDetailsContext } from './document-details-context';

type responseBase = b2bDocuments.DetailsResponseBase<b2bDocuments.SharedDetailsHeaderBase, b2bDocuments.DocumentProductItem>;

export abstract class DocumentDetails<listHeader extends b2bDocuments.SharedDetailsHeaderBase, listItem extends b2bDocuments.DocumentDetailsItemBase, response extends responseBase> 
extends DocumentDetailsBase<listHeader, listItem, response>
implements DocumentDetailsContext<listHeader, listItem, response>, Resolve<DocumentDetailsContext<listHeader, listItem, response>> {
    
    summaries: b2bDocuments.DetailsSummary[];

    constructor(configService: ConfigService, printHandlerService: PrintHandlerService) {
        super(configService, printHandlerService);
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): DocumentDetailsContext<listHeader, listItem, response> {
        return this;
    }

    
    protected loadDetailsBase(id: number, propertyNames?: b2bDocuments.PropertyNames) {

        return super.loadDetailsBase(id, propertyNames).pipe(
            tap(res => {
                if (propertyNames.summaryProperty) {
                    this.summaries = res[propertyNames.summaryProperty];
                }
            })
        );
    }

    loadDetails(id: number) {
        return this.loadDetailsBase(id);
    }
}
