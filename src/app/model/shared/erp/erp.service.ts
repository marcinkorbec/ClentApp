import { Injectable } from '@angular/core';
import { ERPContext } from './erpcontext';

@Injectable({
  providedIn: 'root'
})
export class ERPService {

  context: ERPContext;

  constructor() {}

  setContext(context: ERPContext) {
    this.context = context;
  }
}
