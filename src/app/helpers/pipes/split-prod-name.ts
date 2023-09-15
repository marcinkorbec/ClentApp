import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'splitPipe'
})
export class SplitPipe implements PipeTransform {
    transform(val: string, param: string): string[] {
        //console.log("test");
        return val.split(param);
    }
}
