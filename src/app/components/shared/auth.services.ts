import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Cryptojs from 'crypto-js';
import { AES } from 'crypto-js';
import { SHA256 } from 'crypto-js';
import { Response } from '@angular/http/src/static_response';
import * as jwt from 'jsonwebtoken';
import { JWTtoken } from '../../storage';

@Injectable()
export class AuthService {

    public finalRes: any = {};

    constructor(private http: HttpClient) {
    }

    authenticate(user: any) {
        // SHA256(user.email);
        // hashedUser.email = SHA256(hashedUser.email).toString();
        // hashedUser.password = SHA256(hashedUser.password).toString();

        // this.finalRes.token = SHA256(hashedUser.password).toString() +
        //            SHA256('"korpPassKey#12').toString()  + SHA256(hashedUser.email).toString();

        // return  this.http.post('http://localhost:8080/login', this.finalRes, this.getDefaultHeaders());
        return  this.http.post('http://localhost:8080/login', user, this.getDefaultHeaders());
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
