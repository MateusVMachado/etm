import { RequestMethod, RequestOptions } from '@angular/http';
import { ConfigModel } from './config';
import { JWTtoken } from '../../storage';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { Injectable } from '@angular/core';
import { OpenFACConfig } from "openfac/OpenFac.ConfigContract";

@Injectable()
export class ConfigService extends AppServiceBase{

    constructor(private http: HttpClient) {
        super();
    }

    public configure(config: any){
        let configOpenFAC: ConfigModel = new ConfigModel();
        configOpenFAC.openFacConfig = new OpenFACConfig();
        configOpenFAC.language = config.linguagem;
        configOpenFAC.openFacConfig.ActiveSensor = config.sensor;
        configOpenFAC.openFacConfig.ScanType = config.tipoVarredura;
        configOpenFAC.openFacConfig.ScanTime = config.tmpVarredura;
        configOpenFAC.openFacConfig.KeyboardLayout = config.layout;
        return this.http.post('http://localhost:8080/configuration', configOpenFAC, this.getDefaultHeaders());
    }

    getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + JWTtoken.token} };
    }

}