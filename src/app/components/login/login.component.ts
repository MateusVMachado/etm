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
import { UserAndGPS } from '../shared/models/userSession.model';

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

    public latitude: number;
    public longitude: number;

    constructor(protected authService: AuthService,
                protected router: Router,
                private cookieService: CookieService,
                private injector: Injector,
                private configService: GeneralConfigService
                ) { 
                  
                  super(injector);
                  //navigator.geolocation.getCurrentPosition(function(position) {
                    
                  //  this.latitude = position.coords.latitude;
                  //  this.longitude = position.coords.longitude;
                  // });
                
                }


    public ngAfterViewInit(){

      // WORKAROUND PARA RESOLVER PROBLEMA DO BOTÃO DE ENTRAR 
      // NÃO SER ATIVADO COM O AUTOFILL DO BROWSER
      this.user.password = 'inserir'; 
    }          
    
    public geolocationSuccess(position){
        let newUserAndGPS = new UserAndGPS();

        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        newUserAndGPS.latitude = this.latitude.toString();
        newUserAndGPS.longitude = this.longitude.toString();

        let usuario: User = new User();


        newUserAndGPS.email = this.user.email;
        newUserAndGPS.password = this.user.password;

        usuario = this.user;
        //this.authService.authenticate(usuario).subscribe(
        this.authService.authenticate(newUserAndGPS).subscribe(
          (res: any) => {
            usuario.jwt = res.accessToken;
            this.authService.setJWT(usuario.jwt);
            if(this.user.rememberMe){
              window.localStorage.setItem('JWTtoken', res.accessToken);
            }
            this.authService.getUser(usuario.email).subscribe((res:User) => {
              this.authService.setUser(res, usuario.jwt);
              this.router.navigate(['./pages/teclados']);
            });
          }, (error) =>{
            this.messageService.error('Usuário ou senha inválidos', 'Oops..');
          }
       );
    }

    public geolocationFailure(position){

    }

    public login(): void {

      //navigator.geolocation.getCurrentPosition(this.geolocationSuccess.bind(this), this.geolocationFailure.bind(this));
      
      navigator.geolocation.getCurrentPosition(this.geolocationSuccess.bind(this), function(PositionError){
         
       })
      
    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }
}
