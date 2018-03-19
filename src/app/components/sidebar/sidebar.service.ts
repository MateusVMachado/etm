import { AuthService } from '../shared/services/auth.services';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { HttpClient } from '@angular/common/http';
import { KeyboardNamesList } from './keyboards-list.model';

@Injectable()
export class SideBarService extends AppServiceBase{

  
  public sideBarSubject = new Subject<any>();  

  constructor(protected injector: Injector, private http: HttpClient, private authService: AuthService) { 
    super(injector);
  }

  emitSideBarCommand(editor: any) {
    this.sideBarSubject.next(editor);
  }

  subscribeTosideBarSubject() {
      return this.sideBarSubject.asObservable();      
  }
  
  loadKeyboardsNames(email: string) {
    return this.http.get<KeyboardNamesList>(this.backendAddress + `/keyboard/getKeyboardNames?email=${email}`);
  }

}