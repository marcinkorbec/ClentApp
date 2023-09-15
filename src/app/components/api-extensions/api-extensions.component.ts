import { Input, ViewEncapsulation } from '@angular/core';
import { Component } from '@angular/core';
import { ConvertingUtils } from 'src/app/helpers/converting-utils';
import { ResourcesService } from 'src/app/model/resources.service';
import { b2bShared } from 'src/integration/b2b-shared';

@Component({
    selector: 'app-api-extensions',
    templateUrl: './api-extensions.component.html',
    styleUrls: ['./api-extensions.component.scss'],
    host: { 'class': 'api-extensions' },
    encapsulation: ViewEncapsulation.None
})
export class ApiExtensionsComponent {

    private _data: b2bShared.GenericCollection<string, any>;

    @Input()
    removeElementContainer: boolean;

    @Input()
    set data(obj: b2bShared.GenericCollection<string, any> | b2bShared.ApiExtensionElement[]) {
 
        if (!obj || obj === this._data) {
            return;
        }
        this._data = Array.isArray(obj) ? ConvertingUtils.convertOldApiExtensionsToNew(obj) : obj;
    }

    get data() {
        return this._data;
    }

    constructor(public r: ResourcesService) {}

    removeUnderscorePrefix(str: string) {
        return ConvertingUtils.removeUnderscorePrefix(str);
    }

    getTranslationsKey(str) {
        return ConvertingUtils.lowercaseFirstLetter(ConvertingUtils.removeUnderscorePrefix(str));
    }
    
}
