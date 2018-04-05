import { ConfigModel } from '../general-config/config.model';
import { User } from '../shared/models/user';
import { GeneralConfigService } from '../general-config/general-config.service';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { Component, ViewChild, OnInit, Injector, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.services';
import 'rxjs/add/operator/catch';
import { NgForm } from '@angular/forms';
import { LoginAuthenticateModel } from "./login-authenticate.model";
import { UserAndGPS } from '../shared/models/userSession.model';
import { AppServiceBase } from '../shared/services/app-service-base.service';

@Component({
    selector: 'nb-login',
    templateUrl: './login.component.html',
})

export class LoginComponent extends AppBaseComponent implements AfterViewInit, OnInit  {
  
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
                protected injector: Injector,
                private configService: GeneralConfigService
                ) { super(injector) }

    public ngOnInit(){
      let idiomaCookie = window.localStorage.getItem('Language');
      let idiomaBrowser = window.navigator.language;
      if(idiomaCookie){
        this.messageService.setLanguage(idiomaCookie);
      }else if(idiomaBrowser === 'en' || idiomaBrowser === 'pt-BR' || idiomaBrowser === 'es'){
         if(idiomaBrowser === 'pt-BR'){
          idiomaBrowser = 'pt-br'
        }
        this.messageService.setLanguage(idiomaBrowser);
      }
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
        this.authService.authenticate(newUserAndGPS).subscribe(
          (res: any) => {
            console.log(JSON.stringify(res));
            let resObj = JSON.parse(res);
            usuario.jwt = resObj.accessToken;

            this.authService.setJWT(usuario.jwt);
            if(this.user.rememberMe){
              window.localStorage.setItem('JWTtoken', resObj.accessToken);
              window.localStorage.setItem('User', usuario.email);
            }
            this.authService.getUser(usuario.email).subscribe((res:User) => {
              this.authService.setUser(res, usuario.jwt);
              this.configService.getConfiguration(usuario.email).subscribe((result: ConfigModel) => {

                this.router.navigate(['./pages/teclados']);
              });
            });
          }, (error) =>{
            console.log(JSON.stringify(error));
            if(error.error.message === "MENSAGEM_DADOS_INVALIDOS"){
              let message = this.messageService.getTranslation('MENSAGEM_DADOS_INVALIDOS');
              this.messageService.error(message, 'Oops..');
            } else {
              let message = 'o.O';
              this.messageService.error(message, 'Oops..');
            }
          }
       );
    }

    public geolocationFailure(){
      let newUserAndGPS = new UserAndGPS();

      let usuario: User = new User();
      newUserAndGPS.email = this.user.email;
      newUserAndGPS.password = this.user.password;

      usuario = this.user;
      this.authService.authenticate(newUserAndGPS).subscribe(
        (res: any) => {
          console.log(JSON.stringify(res));
          let resObj = JSON.parse(res);
          usuario.jwt = resObj.accessToken;
          this.authService.setJWT(usuario.jwt);
          if(this.user.rememberMe){
            window.localStorage.setItem('JWTtoken', resObj.accessToken);
            window.localStorage.setItem('User', usuario.email);
          }
          this.authService.getUser(usuario.email).subscribe((res:User) => {

            this.authService.setUser(res, usuario.jwt);
   
            this.router.navigate(['./pages/teclados']);
          });
        }, (error) =>{
          console.log(JSON.stringify(error));
          if(error.error.message === "MENSAGEM_DADOS_INVALIDOS"){
            let message = this.messageService.getTranslation('MENSAGEM_DADOS_INVALIDOS');
            this.messageService.error(message, 'Oops..');
          } else {
            let message = 'o.O';
            this.messageService.error(message, 'Oops..');
          }
        }
     );
    }

    public login(): void {
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(this.geolocationSuccess.bind(this),this.geolocationFailure.bind(this),
          {maximumAge:60000, timeout:5000, enableHighAccuracy:true} ); 
        } else {
          
          this.geolocationFailure();
        }
          
    }    
    

    changeLanguage(event){
      this.messageService.setLanguage(event.toElement.id);
      window.localStorage.setItem('Language', event.toElement.id);
    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }
}
