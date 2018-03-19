import { AuthService } from '../shared/services/auth.services';
import { User } from '../shared/models/user';
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpHeaders } from '@angular/common/http';
import { AppServiceBase } from '../shared/services/app-service-base.service';

@Injectable()
export class ProfileService extends AppServiceBase {
    constructor(protected injector: Injector, private http: HttpClient, private authService: AuthService){
        super(injector);
    }

    updateUser(user: User) {
        return this.http.post(this.backendAddress + '/updateUser', user);
    }

}