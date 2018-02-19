/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { AppBaseComponent } from '../shared/components/app-base.component';
import { Component, Inject, ViewChild, OnInit, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.services';
import { JWTtoken } from '../../storage';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'nb-login',
    templateUrl: './login.component.html',
})

export class NgxLoginComponent extends AppBaseComponent {
    errors: string[] = [];
    messages: string[] = [];
    user: any = {};
    userInfo: any = {};

    constructor(protected service: AuthService,
                protected router: Router,
                private cookieService: CookieService,
                private injector: Injector) { super(injector)}

    public login(): void {
        this.service.authenticate(this.user).subscribe(
          (res: any) => {
              console.log(res['accessToken']);
              this.service.setToken(res['accessToken']);
              JWTtoken.token = res['accessToken'];
              if (JWTtoken.token !== undefined) {
                if (this.user.rememberMe) {
                     this.cookieService.set('token', JWTtoken.token);
                }
                this.router.navigate(['./pages/teclados']);
              }
          }, (error) =>{
            this.messageService.error('Usuário ou senha inválidos', 'Oops..');
          }
       );

    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }
}
