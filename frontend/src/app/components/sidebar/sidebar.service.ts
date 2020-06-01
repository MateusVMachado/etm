import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { AuthService } from '../shared/services/auth.services';
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