import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JWTtoken } from '../../storage';

@Injectable()
export class AuthService {

    constructor(private http: HttpClient) {
    }

    authenticate(user: any) {
        return this.http.post("http://localhost:8080/login", user, this.getDefaultHeaders());
    }

    isAuthenticated() {
        if ( JWTtoken.token !== undefined ) {
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
}
