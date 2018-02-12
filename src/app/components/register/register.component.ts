import { NB_AUTH_OPTIONS_TOKEN, NbAuthService } from '@nebular/auth';
import { getDeepFromObject } from '@nebular/auth/helpers';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../shared/auth.services';

@Component({
  selector: 'nb-register',
  styleUrls: ['./register.component.scss'],
  templateUrl: './register.component.html',
})
export class NgxRegisterComponent {

  redirectDelay: number = 0;
  showMessages: any = {};
  provider: string = '';

  submitted = false;
  errors: string[] = [];
  messages: string[] = [];
  user: any = {};

  constructor(protected service: NbAuthService,
              @Inject(NB_AUTH_OPTIONS_TOKEN) protected config = {},
              protected router: Router) {

    this.redirectDelay = this.getConfigValue('forms.register.redirectDelay');
    this.showMessages = this.getConfigValue('forms.register.showMessages');
    this.provider = this.getConfigValue('forms.register.provider');
  }

  register(): void {
    this.errors = this.messages = [];
    this.submitted = true;
  }

  getConfigValue(key: string): any {
    return getDeepFromObject(this.config, key, null);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
