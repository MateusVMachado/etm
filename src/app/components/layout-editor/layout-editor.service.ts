import { AuthService } from '../shared/services/auth.services';
import { Injectable, Injector } from '@angular/core';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { OpenFACLayout } from './layout.model';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LayoutEditorService extends AppServiceBase {

    public layoutEditorSubject = new Subject<any>(); 
    private user = this.authService.getLocalUser(); 

    constructor(protected injector: Injector, private http: HttpClient, private authService: AuthService){
        super(injector);
    }

    public saveNewKeyboard(layout: OpenFACLayout, email: string){
        return this.http.post(this.backendAddress + `/keyboard/insertNewKeyboard?nameLayout=${layout.nameLayout}&email=${email}` , layout, { responseType: 'text', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.user.jwt} });
    }
    
    public deleteKeyboard(nameLayout: string, email: string){
        return this.http.post(this.backendAddress + `/keyboard/deleteKeyboard?nameLayout=${nameLayout}&email=${email}` , null, { responseType: 'text', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.user.jwt} });
    }

    public emitLayoutEditor(editor: any) {
        this.layoutEditorSubject.next(editor);
    }
      
    
    public subscribeToLayoutEditorSubject() {
          return this.layoutEditorSubject.asObservable();      
    }
    
}