/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, Inject, ViewChild, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.services';
import { JWTtoken } from '../../storage';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';

import { GamepadComponent } from '../gamepad/gamepad.component';

@Component({
    selector: 'nb-login',
    templateUrl: './login.component.html',
})

@Injectable()
export class NgxLoginComponent {  
    //@ViewChild('gps3') gps3: GamepadComponent;
    @ViewChild('loginAlert') private loginAlert: SwalComponent;
    errors: string[] = [];
    messages: string[] = [];
    user: any = {};
    userInfo: any = {};

    constructor(protected service: AuthService,
                protected router: Router,
                private cookieService: CookieService,
                private gamepad: GamepadComponent) {
    }

    public login(): void {
        this.service.authenticate(this.user).catch((error) => {
          this.loginAlert.show();
          throw new Error('usuário ou senha inválido!');
        }).subscribe(
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
          } ,  // changed
       );

    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }


    public stopListenningKeys() {
        console.log("Interrompendo processo...");
        this.gamepad.stopListenningKeys();
      }
    
      public onClickGetGamepads() {
        console.log("Detectando controles...");
        this.gamepad.detectControllers();
      }
    
      public onClickMostrarControles() {
        console.log('Processo iniciado.');
        this.gamepad.doGamepadLoop();
      }


}
