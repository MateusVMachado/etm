/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { User } from '../shared/models/user';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { HttpResponse } from '@angular/common/http/src/response';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.services';
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
      let usuario: User = new User();
      usuario = this.user;
      this.service.register(usuario).subscribe(
          (res: any) => {
            this.messageService.success(res.message).then(res => {
              this.router.navigate(['./auth/login']);
            });
          }, (error: any) => {            
            this.messageService.error(error.message, 'Oops..');
          }
      );
    }

    getConfigValue() { }
    
    navigateTo(path: string) {
      this.router.navigate([path]);
    }
}
