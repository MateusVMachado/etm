import { Component, OnInit } from '@angular/core';
import { JWTtoken } from '../../storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {
    public token: string = JWTtoken.token;

    constructor(private router: Router) {

    }

    ngOnInit() {

    }
}
