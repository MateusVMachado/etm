import { ProfileService } from '../../profile/profile.service';
import { Subject } from 'rxjs/Subject';
import { User } from '../models/user';
import { AppServiceBase } from './app-service-base.service';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService extends AppServiceBase {
    private user: User = new User();
    private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(new User());
    private token: any = undefined;
    public isLoggedIn: boolean;

    constructor(protected injector: Injector, private http: HttpClient, private profileService: ProfileService) {
        super(injector);
    }

    authenticate(user: User) {
        return this.http.post(this.backendAddress + '/login', user, this.getDefaultHeaders());
    }

    isAuthenticated() {
        let token = window.localStorage.getItem('JWTtoken');
        if(token){
            let email = jwt.decode(token).sub;
            this.profileService.getUser(email).subscribe((usuario: User) =>{
                this.setUser(usuario);
            });
            return true
        }
        return false
    }

    register(user: any) {
        return  this.http.post(this.backendAddress + '/register', user, this.getDefaultHeaders()).catch(error=>{
            return this.handleError(error)
        });
    }

    resetPassword() {

    }

    getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem('JWTtoken') } };
    }

    setToken(value: any) {
        this.token = value;
    }

    public getObservableUser(): Observable<User>{
        return this.userSubject.asObservable();
    }

    public getUser(): User{
        return this.user;
    }

    public setUser(user: User){
        this.user = user;
        this.userSubject.next(this.user);
    }
}
