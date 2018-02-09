import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { JWTtoken } from '../../storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DashboardComponent implements OnInit {
    public token: string = JWTtoken.token;

    constructor(private router: Router) {

    }

    ngOnInit() {
      //console.log("RESET");
      //if (JWTtoken.token === undefined) {
      //  this.router.navigate(["./auth"]);
      //}
    }
}
