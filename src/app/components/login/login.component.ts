/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.services';
import { SwalComponent } from "@toverux/ngx-sweetalert2";
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'nb-login',
    templateUrl: './login.component.html',
})
export class NgxLoginComponent {
    @ViewChild('loginAlert') private loginAlert: SwalComponent;
    errors: string[] = [];
    messages: string[] = [];
    user: any = {};

    constructor(protected service: AuthService,
                protected router: Router,
                private cookieService: CookieService) {
    }

    login(): void {
        this.service.authenticate(this.user).catch((error) => {
          this.loginAlert.show();
          throw new Error("usuário ou senha inválido!");
        }).subscribe((res: any) => {
          const token = res['accessToken'];
          if (token !== undefined) {
            if (this.user.rememberMe ) {
              this.cookieService.set( 'token', token );
            }
            this.router.navigate(['./pages/teclados']);
          }
        });
    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }

}
