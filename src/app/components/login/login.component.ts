/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.services';
import { JWTtoken } from '../../storage';
import { SwalComponent } from "@toverux/ngx-sweetalert2";
import 'rxjs/add/operator/catch';

@Component({
    selector: 'nb-login',
    template: `
    <nb-auth-block>
      <h2 class="title">Entrar</h2>
      <small class="form-text sub-title" style="margin-top: 8px;">Olá! Entre com o seu usuário ou email</small>
      <form (ngSubmit)="login()" #form="ngForm" autocomplete="nope" style="margin-top: 8px;">
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
          <label for="input-email" class="sr-only">Email address</label>
          <input name="email" [(ngModel)]="user.email" id="input-email" pattern=".+@.+\..+"
                 class="form-control" placeholder="Email address" #email="ngModel"
                 [class.form-control-danger]="email.invalid && email.touched" autofocus
                 [required]="true">
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
                 [required]="true"
                 [minlength]="4"
                 [maxlength]="20">
          <small class="form-text error" *ngIf="password.invalid && password.touched && password.errors?.required">
            Password is required!
          </small>
          <small
            class="form-text error"
            *ngIf="password.invalid && password.touched && (password.errors?.minlength || password.errors?.maxlength)">
            Password should contains
            from {{ 4 }}
            to {{ 20 }}
            characters
          </small>
        </div>
        <div class="form-group accept-group col-sm-12">
          <nb-checkbox name="rememberMe" [(ngModel)]="user.rememberMe">Remember me</nb-checkbox>
          <a class="forgot-password" (click)="navigateTo('./auth/request-password')">Forgot Password?</a>
        </div>
        <button [disabled]="submitted || !form.valid" class="btn btn-block btn-hero-success"
                [class.btn-pulse]="submitted">
          Sign In
        </button>
      </form>
      <div class="links" style="margin-top: 16px; text-align: center;">
        <small class="form-text">
          Don't have an account? <a (click)="navigateTo('./auth/register')"><strong>Sign Up</strong></a>
        </small>
      </div>
      <swal
        #loginAlert
        title="Algo deu errado"
        text="Usuário ou senha inválido!"
        type="warning"
        background="#ffffff">
      </swal>
    </nb-auth-block>
  `,
})
export class NgxLoginComponent {
    @ViewChild('loginAlert') private loginAlert: SwalComponent;
    errors: string[] = [];
    messages: string[] = [];
    user: any = {};
    userInfo: any = {};

    constructor(protected service: AuthService,
                protected router: Router) {
    }

    public login(): void {
        this.service.authenticate(this.user).catch((error) => {
          this.loginAlert.show();
          throw new Error("usuário ou senha inválido!");
        }).subscribe(
          (res: any) => {
              console.log(res['accessToken']);
              this.service.setToken(res['accessToken']);
              JWTtoken.token = res['accessToken'];
              if (JWTtoken.token !== undefined) {
                this.router.navigate(['./pages/teclados']);
              }
          } ,  // changed
       );

    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }
}
