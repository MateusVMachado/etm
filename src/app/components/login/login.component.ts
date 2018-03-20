import { ConfigModel } from '../general-config/config.model';
import { User } from '../shared/models/user';
import { GeneralConfigService } from '../general-config/general-config.service';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { Component, ViewChild, OnInit, Injector, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.services';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';
import { NgForm } from '@angular/forms';
import { LoginAuthenticateModel } from "./login-authenticate.model";

@Component({
    selector: 'nb-login',
    templateUrl: './login.component.html',
})

export class NgxLoginComponent extends AppBaseComponent implements AfterViewInit, OnInit  {
  
  @ViewChild('form') form: NgForm;
    user: any = {
      email: '',
      password: 'inserir',
      rememberMe: ''
    };

    constructor(protected authService: AuthService,
                protected router: Router,
                private cookieService: CookieService,
                private injector: Injector,
                private configService: GeneralConfigService
                ) { super(injector) }

    public ngAfterViewInit(){
      // WORKAROUND PARA RESOLVER PROBLEMA DO BOTÃO DE ENTRAR 
      // NÃO SER ATIVADO COM O AUTOFILL DO BROWSER
      this.user.password = 'inserir'; 
    }    
    
    ngOnInit(): void { }

    public login(): void {
        let usuario: User = new User();
        usuario = this.user;
        this.authService.authenticate(usuario).subscribe(
          (res: LoginAuthenticateModel) => {
            usuario.jwt = res.accessToken;
            if(this.user.rememberMe){
              window.localStorage.setItem('JWTtoken', res.accessToken);
            }
            this.authService.getUser(usuario.email, usuario.jwt).subscribe((res:User) => {
              this.authService.setUser(res, usuario.jwt)
              this.router.navigate(['./pages/teclados']);
            });
          }, (error) =>{
            this.messageService.error(error.error.message, 'Oops..');
          }
       );
    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }
}
