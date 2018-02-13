/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.services';
import { JWTtoken } from '../../storage';
import 'rxjs/add/operator/catch';

@Component({
    selector: 'nb-register',
    styleUrls: ['./register.component.scss'],
    templateUrl: './register.component.html',
  })

export class NgxRegisterComponent {
    @ViewChild('errorRegisterAlert') private errorRegisterAlert: SwalComponent;
    @ViewChild('registerAlert') private registerAlert: SwalComponent;
    user: any = {};
    userInfo: any = {};

    nameMinLen: number = 3;
    nameMaxLen: number = 30;
    nameRequired: boolean = true;

    emailRequired: boolean = true;

    passwordMinLen: number = 7;
    passwordMaxLen: number = 12;
    passwordRequired: boolean = true;

    passwordConfRequired: boolean = true;
 
    constructor(protected service: AuthService,
                protected router: Router) { }

    public register() {
      this.service.register(this.user).subscribe(
          (res: any) => {
              if (res.message === 'Registro feito com sucesso.' ) {
                this.registerAlert.show();
                this.router.navigate(['./pages/login']);
              }
          }, (error) => {
            if(error.status === 400){
              this.errorRegisterAlert.show();
            }
          }
      );
    }

    getConfigValue() {

    }
}
