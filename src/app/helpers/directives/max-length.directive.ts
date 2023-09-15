import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appMaxLength]'
})
export class MaxLengthDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input') onInput() {
    const maxLength = 2000;
    const currentValue = this.el.nativeElement.value;
    if (currentValue.length > maxLength) {
      this.el.nativeElement.value = currentValue.slice(0, maxLength);
    }
  }
}
