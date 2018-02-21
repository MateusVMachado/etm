import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs';

@Injectable()
export class DataService {

  //private messageSource = new BehaviorSubject<any>(undefined);
  private messageSource = new Subject<any>();
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: any) {
    this.messageSource.next(message);
  }


}