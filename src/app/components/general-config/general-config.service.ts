import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { OpenFACLayout } from "openfac/OpenFac.ConfigContract";
import { Subject } from 'rxjs';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { AuthService } from '../shared/services/auth.services';
import { ConfigModel } from './config.model';

@Injectable()
export class GeneralConfigService extends AppServiceBase{
    public config: any = {};
    private http: HttpClient;

    public generalConfigPayloadSubject = new Subject<any>();  


    public configuration = {};
    constructor(protected injector: Injector,  private authService: AuthService) {
        super(injector);
        this.http = this.injector.get(HttpClient);
    }

    public saveConfiguration(config?: any, keyboardName?:string, level?:number){
        let user = this.authService.getLocalUser();
        let configOpenFAC: ConfigModel = new ConfigModel();
        configOpenFAC.openFacConfig.ActiveSensor = config.sensor;
        configOpenFAC.openFacConfig.ScanType = config.tipoVarredura;
        configOpenFAC.openFacConfig.ScanTimeLines = config.tmpVarreduraLns;
        configOpenFAC.openFacConfig.ScanTimeColumns = config.tmpVarreduraCls;
        configOpenFAC.user = user.email;
        configOpenFAC.openFacConfig.KeyboardLayout = config.layout;
        configOpenFAC.lastKeyboard = keyboardName;
        configOpenFAC.level = level;
        configOpenFAC.flexSup = config.flexSup;
        configOpenFAC.flexUnd = config.flexUnd;
        

        return this.http.post(this.backendAddress + '/configuration', configOpenFAC, { responseType: 'text'});
    }

    public updateFlexConfiguration(newFlexSup: string, newFlexUnd: string, email: string){
        let payload = [];
        payload.push(newFlexSup);
        payload.push(newFlexUnd);
        payload.push(email);

        // console.log("PAYLOAD: " + payload);
        return this.http.post(this.backendAddress + '/configurationUpdate', payload, { responseType: 'text'});
    }

    public saveOnlyLastKeyboard(keyboardName?:string){
        let user = this.authService.getLocalUser();
        return this.http.post(this.backendAddress + `/configuration?email=${user.email}&onlyKeyboard=${keyboardName}`, '');
    }

    public getConfiguration(email: string){
        return this.http.get<ConfigModel>(this.backendAddress + `/configuration?email=${email}`);
    }

    public returnLastUsed(lastUsed: number, openFacLayout: OpenFACLayout, data: any) {
        let user = this.authService.getLocalUser();
        return this.http.get(this.backendAddress + `/configuration?email=${user.email}`);
    }


    public emitGeneralConfigPayload(editor: any) {
        this.generalConfigPayloadSubject.next(editor);
    }
      
    
    public subscribeToGeneralConfigPayloadSubject() {
          return this.generalConfigPayloadSubject.asObservable();      
    }

    
}