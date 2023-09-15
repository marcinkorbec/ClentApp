import { Component, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { b2bShared } from 'src/integration/b2b-shared';
import { OptionBaseStatus } from 'src/app/model/shared/enums/option-base-status.enum';
@Component({
    selector: 'app-switch',
    templateUrl: './switch.component.html',
    styleUrls: ['./switch.component.scss'],
    host: { 'class': 'app-switch' },
    encapsulation: ViewEncapsulation.None,
})
export class SwitchComponent {

    @Input()
    data: b2bShared.SwitchControlModel;

    @Output()
    optionChanged: EventEmitter<b2bShared.PropertyValuePreviewModel>;

    constructor() {
        this.optionChanged = new EventEmitter();
    }

    onClickOption(valueId: number) {
        this.data.values = this.data?.values?.map(value => {
            if (value.status === OptionBaseStatus.Checked) {
                value.status = OptionBaseStatus.Available;
            }
            if (value.id === valueId) {
                value.status = OptionBaseStatus.Checked;
            }
            return value;
        });

        const model = this.prepareSwitchControlSelectedModel(this.data.id, valueId);
        this.optionChanged.emit(model);
    }

    private prepareSwitchControlSelectedModel(propertyId: number, valueId: number): b2bShared.PropertyValuePreviewModel {
        return { propertyId, valueId };
    }
}
