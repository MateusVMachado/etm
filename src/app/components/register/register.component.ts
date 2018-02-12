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

// import { NB_AUTH_OPTIONS_TOKEN } from '../../auth.options';
// import { getDeepFromObject } from '../../helpers';

// import { NbAuthService } from '../../services/auth.service';
// import { NbAuthResult } from '../../services/auth-result';

@Component({
    selector: 'nb-register',
    styleUrls: ['./register.component.scss'],
    template: `
      <nb-auth-block>
        <h2 class="title">Sign Up2</h2>
        <form (ngSubmit)="register()" #form="ngForm">
          <div *ngIf="errors && errors.length > 0 && !submitted"
               class="alert alert-danger" role="alert">
            <div><strong>Oh snap!</strong></div>
            <div *ngFor="let error of errors">{{ error }}</div>
          </div>
          <div *ngIf="messages && messages.length > 0 && !submitted"
               class="alert alert-success" role="alert">
            <div><strong>Hooray!</strong></div>
            <div *ngFor="let message of messages">{{ message }}</div>
          </div>
          <div class="form-group">
            <label for="input-name" class="sr-only">Full name</label>
            <input name="fullName" [(ngModel)]="user.fullName" id="input-name" #fullName="ngModel"
                   class="form-control" placeholder="Full name"
                   [class.form-control-danger]="fullName.invalid && fullName.touched"
                   [required]="nameRequired"
                   [minlength]="nameMinLen"
                   [maxlength]="nameMaxLen"
                   autofocus>
            <small class="form-text error" *ngIf="fullName.invalid && fullName.touched && fullName.errors?.required">
              Full name is required!
            </small>
            <small
              class="form-text error"
              *ngIf="fullName.invalid && fullName.touched && (fullName.errors?.minlength || fullName.errors?.maxlength)">
              Full name should contains
              from {{nameMinLen}}
              to {{nameMaxLen}}
              characters
            </small>
          </div>
          <div class="form-group">
            <label for="input-email" class="sr-only">Email address</label>
            <input name="email" [(ngModel)]="user.email" id="input-email" #email="ngModel"
                   class="form-control" placeholder="Email address" pattern=".+@.+\..+"
                   [class.form-control-danger]="email.invalid && email.touched"
                   [required]="emailRequired">
            <small class="form-text error" *ngIf="email.invalid && email.touched && email.errors?.required">
              Email is required!
            </small>
            <small class="form-text error"
                   *ngIf="email.invalid && email.touched && email.errors?.pattern">
              Email should be the real one!
            </small>
          </div>
          <div class="form-group">
            <label for="input-password" class="sr-only">Password</label>
            <input name="password" [(ngModel)]="user.password" type="password" id="input-password"
                   class="form-control" placeholder="Password" #password="ngModel"
                   [class.form-control-danger]="password.invalid && password.touched"
                   [required]="passwordRequired"
                   [minlength]="passwordMinLen"
                   [maxlength]="passwordMaxLen">
            <small class="form-text error" *ngIf="password.invalid && password.touched && password.errors?.required">
              Password is required!
            </small>
            <small
              class="form-text error"
              *ngIf="password.invalid && password.touched && (password.errors?.minlength || password.errors?.maxlength)">
              Password should contains
              from {{passwordMinLen}}
              to {{passwordMaxLen}}
              characters
            </small>
          </div>
          <div class="form-group">
            <label for="input-re-password" class="sr-only">Repeat password</label>
            <input
              name="rePass" [(ngModel)]="user.confirmPassword" type="password" id="input-re-password"
              class="form-control" placeholder="Confirm Password" #rePass="ngModel"
              [class.form-control-danger]="(rePass.invalid || password.value != rePass.value) && rePass.touched"
              [required]="passwordConfRequired">
            <small class="form-text error"
                   *ngIf="rePass.invalid && rePass.touched && rePass.errors?.required">
              Password confirmation is required!
            </small>
            <small
              class="form-text error"
              *ngIf="rePass.touched && password.value != rePass.value && !rePass.errors?.required">
              Password does not match the confirm password.
            </small>
          </div>
          <button [disabled]="submitted || !form.valid" class="btn btn-block btn-hero-success"
                  [class.btn-pulse]="submitted">
            Register
          </button>
        </form>
        <div class="links">
          <small class="form-text">
            Already have an account? <a routerLink="../login"><strong>Sign in</strong></a>
          </small>
        </div>
      </nb-auth-block>
    `,
  })

export class NgxRegisterComponent {
    @ViewChild('loginAlert') private loginAlert: SwalComponent;
    // messages: string[] = [];
    errors: string[] = [];
    messages: string[] = [];
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
                protected router: Router) {
}

    public register() {
        this.service.register(this.user).subscribe(
            (res: any) => {
                  if (res.status !== 400 ) {
                    console.log('REGISTRADO!');
                    this.router.navigate(['./pages/login']);
                  } else {
                    console.log("ERRO DE REGISTRO!");
                    // Mostrar alerta
                  }
            }
        );
    }

    getConfigValue() {

    }
/*
    register(): void {
        this.errors = this.messages = [];
        this.submitted = true;

        this.service.register(this.user).subscribe((result: NbAuthResult) => {
          this.submitted = false;
          if (result.isSuccess()) {
            this.messages = result.getMessages();
          } else {
            this.errors = result.getErrors();
          }

          const redirect = result.getRedirect();
          if (redirect) {
            setTimeout(() => {
              return this.router.navigateByUrl(redirect);
            }, this.redirectDelay);
          }
        });
      }

      

    getConfigValue(key: string): any {
        return getDeepFromObject(this.config, key, null);
      }
*/
}
