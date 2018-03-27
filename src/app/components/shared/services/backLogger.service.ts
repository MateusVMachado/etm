import { AppServiceBase } from "./app-service-base.service";
import { Injector, Injectable } from "@angular/core";
import { AuthService } from './auth.services';
import { HttpClient } from '@angular/common/http';
import { UserSessionModel } from "../models/userSession.model";

@Injectable()
export class BackLoggerService extends AppServiceBase{

    constructor(protected injector: Injector, private authService: AuthService, private http: HttpClient){
        super(injector);
    }

    public sendLayoutIntervalNow(userSession: UserSessionModel){
        //let user = this.authService.getLocalUser();
        //let payload = { "user" : user.email };
        return this.http.post(this.backendAddress + '/setLayoutEditorIntervals', userSession ,{ responseType: 'text' });
      }

      public sendKeyboardIntervalNow(userSession: UserSessionModel){
        //let user = this.authService.getLocalUser();
        //let payload = { "user" : user.email };
        return this.http.post(this.backendAddress + '/setKeyboardIntervals', userSession ,{ responseType: 'text' });
      } 
      
      public sendConfigIntervalNow(userSession: UserSessionModel){
        //let user = this.authService.getLocalUser();
        //let payload = { "user" : user.email };
        return this.http.post(this.backendAddress + '/setConfigIntervals', userSession ,{ responseType: 'text' });
      }  

}