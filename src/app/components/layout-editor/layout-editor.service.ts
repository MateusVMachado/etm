import { Injectable, Injector } from '@angular/core';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { OpenFACLayout } from './layout.model';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LayoutEditorService extends AppServiceBase {

    constructor(protected injector: Injector, private http: HttpClient){
        super(injector);
    }

    public saveNewKeyboard(layout: OpenFACLayout){
        return this.http.post(this.backendAddress + '/keyboard/insertNewKeyboard' , layout, { responseType: 'text' });
    }
    
}