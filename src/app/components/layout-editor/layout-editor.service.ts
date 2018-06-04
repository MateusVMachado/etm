import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { AuthService } from '../shared/services/auth.services';
import { OpenFACLayout } from './layout.model';

@Injectable()
export class LayoutEditorService extends AppServiceBase {

    public layoutEditorSubject = new Subject<any>(); 
    public layoutEditorPayloadSubject = new Subject<any>();
    private user = this.authService.getLocalUser(); 

    constructor(protected injector: Injector, private http: HttpClient,
        private authService: AuthService){
        super(injector);
    }

    public saveUpdateKeyboard(layout: OpenFACLayout, email: string){
        return this.http.post(this.backendAddress + `/keyboard/insertUpdateKeyboard?nameLayout=${layout.nameLayout}&email=${email}&shared=${layout.shared}` , layout, { responseType: 'text' });
    }   

    public updateOnlyKeyboard(layout: OpenFACLayout, email: string){
        return this.http.post(this.backendAddress + `/keyboard/insertUpdateOnlyKeyboard?nameLayout=${layout.nameLayout}&email=${email}` , layout, { responseType: 'text' });
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

    public emitLayoutEditorPayload(editor: any) {
        this.layoutEditorPayloadSubject.next(editor);
    }
      
    
    public subscribeToLayoutEditorPayloadSubject() {
          return this.layoutEditorPayloadSubject.asObservable();      
    }
}