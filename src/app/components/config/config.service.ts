import { AuthService } from '../shared/services/auth.services';
import { RequestMethod, RequestOptions } from '@angular/http';
import { ConfigModel } from './config';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { Injectable } from '@angular/core';
import { OpenFACConfig } from "openfac/OpenFac.ConfigContract";
import { JWTtoken } from '../../storage';

@Injectable()
export class ConfigService extends AppServiceBase{

    public configuration = {};
    constructor(private http: HttpClient, private authService: AuthService) {
        super();
    }

    public saveConfiguration(config: any){
        let user = this.authService.getUser();
        let configOpenFAC: ConfigModel = new ConfigModel();
        configOpenFAC.language = config.linguagem;
        configOpenFAC.openFacConfig.ActiveSensor = config.sensor;
        configOpenFAC.openFacConfig.ScanType = config.tipoVarredura;
        configOpenFAC.openFacConfig.ScanTime = config.tmpVarredura;
        configOpenFAC.user = user.email;
        
        return this.http.post('http://localhost:8080/configuration', configOpenFAC, this.getDefaultHeaders());
    }

    public getConfiguration(email: string){
        return this.http.get(`http://localhost:8080/configuration?email=${email}`, this.getDefaultHeaders());
    }

    private getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + JWTtoken.token} };
    }

}