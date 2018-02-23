import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class OpenFacKeyCommandService {

  
  public KeyCommandSubject = new Subject<any>();  

  constructor() { }

  emitKeyCommand(keyCommand: any) {
    this.KeyCommandSubject.next(keyCommand);
  }

  subscribeToKeyCommandSubject() {
      return this.KeyCommandSubject.asObservable();      
  }


}