import { Subject } from 'rxjs/Subject';
import { User } from '../models/user';
import { AppServiceBase } from './app-service-base.service';
import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JWTtoken } from '../../../storage';
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class AuthService extends AppServiceBase {
    private user: User = new User();
    private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(new User());
    private token: any = undefined;

    constructor(protected injector: Injector, private http: HttpClient) {
        super(injector);
    }

    authenticate(user: User) {
        return this.http.post(this.backendAddress + '/login', user, this.getDefaultHeaders());
    }

    isAuthenticated(): boolean {
        if ( JWTtoken.token !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    logout() {

    }

    register(user: any) {
        return  this.http.post(this.backendAddress + '/register', user, this.getDefaultHeaders()).catch(error=>{
            return this.handleError(error)
        });
    }

    resetPassword() {

    }

    getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json' } };
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
