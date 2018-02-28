import { User } from '../shared/models/user';
import { JWTtoken } from '../../storage';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class ProfileService {
    constructor(private http: HttpClient){}

    updateUser(user: User) {
        return this.http.post('http://localhost:8080/updateUser', user, this.getDefaultHeaders());
    }

    getUser(email:string) {
        return this.http.get(`http://localhost:8080/user?email=${email}`, this.getDefaultHeaders());
    }

    getDefaultHeaders() {
        return { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + JWTtoken.token } };
    }
}