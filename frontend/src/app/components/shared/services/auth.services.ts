import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import * as jwt from 'jsonwebtoken';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import { User } from '../models/user';
import { AppServiceBase } from './app-service-base.service';

@Injectable()
export class AuthService extends AppServiceBase {
    private user: User = new User();
    private userSubject: BehaviorSubject<User> = new BehaviorSubject<User>(new User());
    private token: any = undefined;
    public isLoggedIn: boolean;
    
    constructor(protected injector: Injector, private http: HttpClient) {
        super(injector);
    }
    
    // authenticate(user: UserAndGPS) {
    //     return this.http.post(this.backendAddress + '/login', user, { responseType: 'text'});
    // }
    
    authenticate(user: User) {
        return this.http.post(this.backendAddress + '/login', user, { responseType: 'text'});
    }
    setUserGPS(user: any) {
        return this.http.post(this.backendAddress + '/loginLoggerGps', user, { responseType: 'text'});
    }
    
    isAuthenticated() {
        let token = window.localStorage.getItem('JWTtoken');
        let user = this.getLocalUser();
        if(user.jwt === undefined) user.jwt = window.localStorage.getItem('JWTtoken');
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
        return  this.http.post(this.backendAddress + '/register', user).catch(error=>{
            return this.handleError(error)
        });
    }
    
    registerBasicKeyboard(user: any) {
        return  this.http.post(this.backendAddress + '/keyboard/insertBasicAtRegister', user, { responseType: 'text'});
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
        return this.http.get(this.backendAddress + `/user?email=${email}`);
    }
    
    public setUser(user: User, jwt?: string){
        this.user = user;
        if(jwt){
            user.jwt = jwt;
        }
        this.userSubject.next(this.user);
    }
    
    public getJWT(){
        return this.user.jwt;   
    }
    
    public setJWT(jwt){
        this.user.jwt = jwt;
    }
    public sendEmail(emailUser : string,emailHostName: string, emailTitulo : string,emailAssunto : string, emailBody : string){
        return this.http.post(this.backendAddress + '/sendEmail', {"email":emailUser,"emailHostName":emailHostName,"emailTitulo":emailTitulo, "emailAssunto": emailAssunto,"emailBody":emailBody}, { responseType: 'text'});
    }
    
    public isAccountBlocked(email : string){
        return this.http.get(this.backendAddress + `/isAccountBlocked?email=${email}`);
    }
    
    public blockAccount(email : string, desbloqueio : string){
        return this.http.get(this.backendAddress + `/blockAccount?email=${email}&desbloqueio=${desbloqueio}`);
    }
}
