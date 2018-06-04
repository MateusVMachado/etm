import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { User } from '../shared/models/user';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { AuthService } from '../shared/services/auth.services';

@Injectable()
export class ProfileService extends AppServiceBase {
    constructor(protected injector: Injector, private http: HttpClient, private authService: AuthService){
        super(injector);
    }

    updateUser(user: User) {
        return this.http.post(this.backendAddress + '/updateUser', user);
    }
    public updateUserPassword(userEmail : string, newPassword : string){
        // let envio = [userEmail,newPassword];
        return this.http.post(this.backendAddress + '/updateUserPassword', {"email": userEmail, "newPassword":newPassword});
    }

}