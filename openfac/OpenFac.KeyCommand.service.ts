import { Subject, Subscription } from '../rxjs';
import { Observable } from 'rxjs/Observable';


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