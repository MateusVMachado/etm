import { AuthService } from '../shared/services/auth.services';
import { JWTtoken } from '../../storage';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ProfileService {
    constructor(private http: HttpClient, private authService: AuthService){}

    updateUser(user: any) {
        return this.http.post('http://localhost:8080/user', user, this.getDefaultHeaders());
    }

    getUser(email:string) {
        return this.http.get(`http://localhost:8080/user?email=${email}`, this.getDefaultHeaders());
    }

    getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json', 'Authorization': JWTtoken.token } };
    }
}