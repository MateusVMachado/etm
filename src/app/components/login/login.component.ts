import { ProfileService } from '../profile/profile.service';
import { ConfigModel } from '../config/config';
import { User } from '../shared/models/user';
import { ConfigService } from '../config/config.service';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { Component, ViewChild, OnInit, Injector, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.services';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'nb-login',
    templateUrl: './login.component.html',
})

export class NgxLoginComponent extends AppBaseComponent implements AfterViewInit  {
    @ViewChild('form') form: NgForm;
    user: any = {
      email: '',
      password: 'inserir',
      rememberMe: ''
    };

    constructor(protected service: AuthService,
                protected router: Router,
                private cookieService: CookieService,
                private injector: Injector,
                private profileService: ProfileService,
                private configService: ConfigService
                ) { super(injector)}

    public ngAfterViewInit(){
      // WORKAROUND PARA RESOLVER PROBLEMA DO BOTÃO DE ENTRAR 
      // NÃO SER ATIVADO COM O AUTOFILL DO BROWSER
      this.user.password = 'inserir'; 
    }                

    public login(): void {
        let usuario: User = new User();
        usuario = this.user;
        this.service.authenticate(usuario).subscribe(
          (res: any) => {
              window.localStorage.setItem('JWTtoken', res['accessToken']);
              this.configService.getConfiguration(this.user.email).subscribe((result: ConfigModel) => {
                //TODO: chamar função de translate e de configuração do teclado
              }, (error: any) => {
                this.messageService.error("Ocorreu um problema ao buscar suas configurações", "Oops..");
              })

              this.profileService.getUser(usuario.email).subscribe((result: User) => {
                this.service.setUser(result);
                this.router.navigate(['./pages/teclados']);
              });
          }, (error) =>{
            this.messageService.error('Usuário ou senha inválidos', 'Oops..');
          }
       );

    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }
}
