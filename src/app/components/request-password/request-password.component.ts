import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'nb-request-password-page',
  styleUrls: ['./request-password.component.scss'],
  templateUrl: './request-password.component.html',
})
export class RequestPasswordComponent {
  submitted = false;
  user: any = {};

  constructor(protected router: Router) {}

  requestPass(): void {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

}