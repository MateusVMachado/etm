import { LoginAuthenticateModel } from '../../login/login-authenticate.model';
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

    constructor(protected injector: Injector, private http: HttpClient) {
        super(injector);
    }

    authenticate(user: User) {
        return this.http.post<LoginAuthenticateModel>(this.backendAddress + '/login', user, this.getDefaultHeaders());
    }

    isAuthenticated() {
        let token = window.localStorage.getItem('JWTtoken');
        let user = this.getLocalUser();
        if(token || user.jwt){
            if(token){
                let tokenDecode = jwt.decode(token);
                let dateNow = Date.now().valueOf() / 1000;
                if(tokenDecode.exp < dateNow){
                    window.localStorage.removeItem('JWTtoken');
                    return false
                }
                this.getUser(jwt.decode(token).sub).subscribe((usuario: User) =>{
                    this.setUser(usuario, token);
                });
            }
            return true
        }
        return false
    }

    register(user: any) {
        return  this.http.post(this.backendAddress + '/register', user, this.getDefaultHeaders()).catch(error=>{
            return this.handleError(error)
        });
    }

    registerBasicKeyboard(user: any) {
        return  this.http.post(this.backendAddress + '/keyboard/insertBasicAtRegister', user, { responseType: 'text'});
    }

    resetPassword() {

    }

    getDefaultHeaders() {
        let user = this.getLocalUser();
        return { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.jwt}};
    }

    setToken(value: any) {
        this.token = value;
    }

    public getObservableUser(): Observable<User>{
        return this.userSubject.asObservable();
    }

    public getLocalUser(): User{
        return this.user;
    }

    public getUser(email:string) {
        return this.http.get(this.backendAddress + `/user?email=${email}`, this.getDefaultHeaders());
    }

    public setUser(user: User, jwt?: string){
        this.user = user;
        this.user.jwt = jwt;
        this.userSubject.next(this.user);
    }
}
