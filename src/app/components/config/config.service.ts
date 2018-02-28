import { AuthService } from '../shared/services/auth.services';
import { RequestMethod, RequestOptions } from '@angular/http';
import { ConfigModel } from './config';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { Injectable } from '@angular/core';
import { OpenFACConfig, OpenFACLayout } from "openfac/OpenFac.ConfigContract";
import { JWTtoken } from '../../storage';
import { User } from '../shared/models/user';

@Injectable()
export class ConfigService extends AppServiceBase{
    public config: any = {};

    public configuration = {};
    constructor(private http: HttpClient, private authService: AuthService) {
        super();
    }

    public saveConfiguration(config?: any, keyboardName?:string){
        let user = this.authService.getUser();
        let configOpenFAC: ConfigModel = new ConfigModel();
        configOpenFAC.language = config.linguagem;
        configOpenFAC.openFacConfig.ActiveSensor = config.sensor;
        configOpenFAC.openFacConfig.ScanType = config.tipoVarredura;
        configOpenFAC.openFacConfig.ScanTime = config.tmpVarredura;
        configOpenFAC.user = user.email;
        configOpenFAC.lastKeyboard = keyboardName;
        return this.http.post('http://localhost:8080/configuration', configOpenFAC, { responseType: 'text' });
    }

    public saveOnlyLastKeyboard(keyboardName?:string){
        let user = this.authService.getUser();
        return this.http.post(`http://localhost:8080/configuration?email=${user.email}&onlyKeyboard=${keyboardName}`, { responseType: 'text' });
    }

    public getConfiguration(email: string){
        return this.http.get<ConfigModel>(`http://localhost:8080/configuration?email=${email}`, this.getDefaultHeaders());
    }

    private getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + JWTtoken.token}};
    }

    public returnLastUsed(lastUsed: number, openFacLayout: OpenFACLayout, data: any) {
        let user = this.authService.getUser();
        return this.http.get(`http://localhost:8080/configuration?email=${user.email}`, this.getDefaultHeaders());
    }

}