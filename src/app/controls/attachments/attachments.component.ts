import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { b2bShared } from 'src/integration/b2b-shared';
import { AttachmentType } from '../../model/shared/enums/attachment-type.enum';
import { Config } from '../../helpers/config';
import { TargetLinkType } from '../../model/shared/enums/target-link-type.enum';
import { AttachmentsLayoutType } from '../../model/shared/enums/attachments-layout-type.enum';
import { AttachmentsIconType } from '../../model/shared/enums/attachments-icon-type.enum';

@Component({
    selector: 'app-attachments',
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.scss'],
    host: { 'class': 'app-attachments' },
    encapsulation: ViewEncapsulation.None
})
export class AttachmentsComponent implements OnInit {

    private _attachments: b2bShared.AttachmentViewModel[];

    @Input()
    target: TargetLinkType;

    @Input()
    attachmentsLayoutType: AttachmentsLayoutType;

    @Input()
    attachmentsIconType: AttachmentsIconType;

    @Input()
    set attachments(attachments: b2bShared.AttachmentViewModel[]) {
        this._attachments = this.prepareAttachments(attachments);
    }
    get attachments() { return this._attachments; }

    constructor() {
        this.attachmentsLayoutType = AttachmentsLayoutType.HorizontalList;
        this.attachmentsIconType = AttachmentsIconType.FixedClipIcons;
    }

    ngOnInit() {}

    private prepareAttachments(attachments: b2bShared.AttachmentViewModel[]) {
        if (!attachments || attachments.length === 0) {
            return null;
        }

        attachments.forEach(attachment => {
            switch (attachment.type) {
                case AttachmentType.FromBinary:
                    attachment.href = Config.getFileHandlerSrc(attachment.id, attachment.fullName, attachment.hash);
                    attachment.target = this.target ? this.target : TargetLinkType.Self;
                    break;
                case AttachmentType.FromUrl:
                    attachment.href = attachment.url;
                    attachment.target = this.target ? this.target : TargetLinkType.Blank;
                    break;
            }
        });

        return attachments;
    }
}
