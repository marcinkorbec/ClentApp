import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replace'
})
export class ReplacePipe implements PipeTransform {
    transform(value: string): string {
        //MM-DD-YYYY
        return value.substring(3, 5) + '-' + value.substring(0, 2) + '-' + value.substring(6, 10);
    }
}
