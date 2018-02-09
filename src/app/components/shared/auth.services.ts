import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService {

    constructor(private http: HttpClient) {
    }

    authenticate(user: any) {
        return this.http.post("http://192.168.1.107:8080/login", user, this.getDefaultHeaders());
    }

    isAuthenticated() {

    }

    logout() {

    }

    register() {

    }

    resetPassword() {

    }

    getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json' } };
    }
}
