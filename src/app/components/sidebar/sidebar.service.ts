import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SideBarService {

  
  public sideBarSubject = new Subject<any>();  

  constructor() { }

  emitSideBarCommand(editor: any) {
    this.sideBarSubject.next(editor);
  }

  subscribeTosideBarSubject() {
      return this.sideBarSubject.asObservable();      
  }


}