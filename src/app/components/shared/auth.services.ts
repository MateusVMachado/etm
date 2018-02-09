import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JWTtoken } from '../../storage';

@Injectable()
export class AuthService {

    private token: any = undefined;

    constructor(private http: HttpClient) {
        //this.token = JWTtoken.token;
        console.log("TESTE1234");
    }

    authenticate(user: any) {
        return this.http.post("http://localhost:8080/login", user, this.getDefaultHeaders());
    }

    isAuthenticated(): boolean {
        //if( JWTtoken.token !== undefined){
        //    this.token = JWTtoken.token;
       // }
        //console.log("JWTtoken2: " + JWTtoken.token);
        console.log("token: " + this.token);
        if ( JWTtoken.token !== undefined) {
        //if ( this.token !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    logout() {

    }

    register(user: any) {
        return  this.http.post('http://localhost:8080/register', user, this.getDefaultHeaders());
    }

    resetPassword() {

    }

    getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json' } };
    }

    setToken(value: any) {
        this.token = value;
    }
}
