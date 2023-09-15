import { Injectable } from '@angular/core';
import { b2bShared } from 'src/integration/b2b-shared';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable()
export class CommonAttachmentsService {

    private attachmentsChanged: Subject<b2bShared.Attachment[]>;
    attachmentsChanged$: Observable<b2bShared.Attachment[]>;

    constructor() {
        this.attachmentsChanged = new Subject();
        this.attachmentsChanged$ = this.attachmentsChanged as Observable<b2bShared.Attachment[]>;
    }

    updateAttachments(attachments: b2bShared.Attachment[]) {
        this.attachmentsChanged.next(attachments);
    }
}
