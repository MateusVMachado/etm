import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService {

    constructor(private http: HttpClient) {
    }

    authenticate(user: any){
        return this.http.post("http://localhost:8080", user, this.getDefaultHeaders());
    }

    isAuthenticated(){

    }

    logout(){

    }

    register(){

    }

    resetPassword(){

    }

    getDefaultHeaders(){
        return { headers: { 'Content-Type': 'application/json' } };
    }
}