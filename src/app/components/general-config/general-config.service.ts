import { AuthService } from '../shared/services/auth.services';
import { RequestMethod, RequestOptions } from '@angular/http';
import { ConfigModel } from './config.model';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { Injectable } from '@angular/core';
import { OpenFACConfig, OpenFACLayout } from "openfac/OpenFac.ConfigContract";
import { User } from '../shared/models/user';
import { Injector } from '@angular/core';

@Injectable()
export class GeneralConfigService extends AppServiceBase{
    public config: any = {};
    private http: HttpClient;

    public configuration = {};
    constructor(protected injector: Injector,  private authService: AuthService) {
        super(injector);
        this.http = this.injector.get(HttpClient);
    }

    public saveConfiguration(config?: any, keyboardName?:string){
        let user = this.authService.getLocalUser();
        let configOpenFAC: ConfigModel = new ConfigModel();
        configOpenFAC.language = config.linguagem;
        configOpenFAC.openFacConfig.ActiveSensor = config.sensor;
        configOpenFAC.openFacConfig.ScanType = config.tipoVarredura;
        configOpenFAC.openFacConfig.ScanTimeLines = config.tmpVarreduraLns;
        configOpenFAC.openFacConfig.ScanTimeColumns = config.tmpVarreduraCls;
        configOpenFAC.user = user.email;
        configOpenFAC.openFacConfig.KeyboardLayout = config.layout;
        configOpenFAC.lastKeyboard = keyboardName;
        
        return this.http.post(this.backendAddress + '/configuration', configOpenFAC, { responseType: 'text'});
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

}