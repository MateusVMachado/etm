import { Injectable, Injector } from '@angular/core';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { OpenFACLayout } from './layout.model';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable()
export class LayoutEditorService extends AppServiceBase {

    public layoutEditorSubject = new Subject<any>();  

    constructor(protected injector: Injector, private http: HttpClient){
        super(injector);
    }

    public saveNewKeyboard(layout: OpenFACLayout, email: string){
        return this.http.post(this.backendAddress + `/keyboard/insertNewKeyboard?nameLayout=${layout.nameLayout}&email=${email}` , layout, { responseType: 'text' });
    }
    

    public emitLayoutEditor(editor: any) {
        this.layoutEditorSubject.next(editor);
      }
      
    
    public subscribeToLayoutEditorSubject() {
          return this.layoutEditorSubject.asObservable();      
      }
}