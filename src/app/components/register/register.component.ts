/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/catch';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';

@Component({
    selector: 'nb-register',
    styleUrls: ['./register.component.scss'],
    templateUrl: './register.component.html',
  })

export class RegisterComponent extends AppBaseComponent {
    user: any = {};
    userInfo: any = {};

    nameMinLen: number = 3;
    nameMaxLen: number = 30;
    nameRequired: boolean = true;

    emailRequired: boolean = true;

    passwordMinLen: number = 4;
    passwordMaxLen: number = 20;
    passwordRequired: boolean = true;

    passwordConfRequired: boolean = true;
    termsCheckbox
 
    constructor(protected service: AuthService, protected router: Router, injector: Injector) { 
      super(injector) 
    }

    public register() {
      let usuario: User = new User();
      usuario = this.user;
      this.service.register(usuario).subscribe(
          (res: any) => {
            let message = this.messageService.getTranslation('MENSAGEM_CADASTRO_CONCLUIDO');
            this.messageService.success(message).then(res => {
              this.router.navigate(['./auth/login']);
              // console.log(res)
            });
          }, (error) => {
            if(error.message === "Esse email já foi cadastrado!"){
              let message = this.messageService.getTranslation('MENSAGEM_EMAIL_JA_CADASTRADO');
              this.messageService.error(message, 'Oops..');
            }
          }
      );
    }
    
    navigateTo(path: string) {
      this.router.navigate([path]);
    }
}
