import { AppBaseComponent } from '../shared/components/app-base.component';
import { AuthService } from '../shared/services/auth.services';
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'nb-request-password-page',
  styleUrls: ['./request-password.component.scss'],
  templateUrl: './request-password.component.html',
})
export class RequestPasswordComponent extends AppBaseComponent {
  submitted = false;
  user: any = {};

  constructor(protected router: Router, 
              protected authService: AuthService,
              private injector: Injector) { super(injector)}

  requestPass(): void { }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

}