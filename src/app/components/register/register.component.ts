/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { AppBaseComponent } from '../shared/app-base.component';
import { HttpResponse } from '@angular/common/http/src/response';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.services';
import { JWTtoken } from '../../storage';
import 'rxjs/add/operator/catch';
import { Injector } from '@angular/core';

@Component({
    selector: 'nb-register',
    styleUrls: ['./register.component.scss'],
    templateUrl: './register.component.html',
  })

export class NgxRegisterComponent extends AppBaseComponent {
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
 
    constructor(protected service: AuthService, protected router: Router, injector: Injector) { 
      super(injector) 
    }

    public register() {
      this.service.register(this.user).subscribe(
          (res: Response) => {             
            console.log(res);
            this.messageService.success('Usuário cadastrado com sucesso!').then(res => {
              this.router.navigate(['./auth/login']);
            });
          }, (error: HttpErrorResponse) => {  
            if(error.status === 400){
              this.messageService.error('Este email já foi cadastrado', 'Oops..');
            } else{
              this.messageService.error('Houve um error inesperado', 'Oops..');
            }
          }
      );
    }

    getConfigValue() {

    }
}
