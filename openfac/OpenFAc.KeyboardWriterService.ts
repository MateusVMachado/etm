import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';


export class KeyboardWriterService{

  
  public keyboardWriterSubject = new Subject<any>();  

  constructor() { 
  }

  emitKeyboardWriterCommand(flag: any) {
    this.keyboardWriterSubject.next(flag);
  }

  subscribeToKeyboardWriterSubject() {
      return this.keyboardWriterSubject.asObservable();      
  }
  
}