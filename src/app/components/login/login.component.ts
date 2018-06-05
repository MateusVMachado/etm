import { AfterViewInit, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfigModel } from '../general-config/config.model';
import { GeneralConfigService } from '../general-config/general-config.service';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { User } from '../shared/models/user';
import { UserAndGPS } from '../shared/models/userSession.model';
import { AuthService } from '../shared/services/auth.services';
import { isUndefined } from 'util';

@Component({
  selector: 'nb-login',
  templateUrl: './login.component.html',
})


///<reference path='../events/EventDispatcher.ts'/>

/**
* The {{#crossLink "LoginComponent"}}{{/crossLink}} class handles the login process.
*
* @class LoginComponent
* @extends AppBaseComponent
* @implements OnInit, OnDestroy, AfterViewInit
* @constructor
**/
export class LoginComponent extends AppBaseComponent implements AfterViewInit, OnInit, OnDestroy  {
  
  /**
  * A reference to the Subscription Object instance to enable further unsubscribe process.
  *
  * @property loginSubscription
  * @type {Subscription}
  * @readonly
  */
  private loginSubscription: Subscription;
  private getUserSubscription: Subscription;
  private setUserGPSSubscription: Subscription;
  private getConfigurationSubscription: Subscription;
  
  @ViewChild('form') form: NgForm;
  user: any = {
    email: '',
    password: '',
    rememberMe: ''
  };
  
  /**
  * A variable to store the user Latitude.
  *
  * @property latitude
  * @type {number}
  * @readonly
  */
  public latitude: number;
  public longitude: number;
  public clickedOnce: boolean = false;
  public timer: any;
  
  constructor(protected authService: AuthService,
    protected router: Router,
    protected injector: Injector,
    private configService: GeneralConfigService,
    private activatedRoute : ActivatedRoute) { 
      super(injector);
    }
    
    
    public ngOnDestroy(): void {
      if(this.loginSubscription) this.loginSubscription.unsubscribe();
      if(this.getUserSubscription) this.getUserSubscription.unsubscribe();
      if(this.setUserGPSSubscription) this.setUserGPSSubscription.unsubscribe();
      if(this.getConfigurationSubscription) this.getConfigurationSubscription.unsubscribe();
      clearInterval(this.timer);
    }
    
    public ngOnInit(){
      //NÃO PERMITE VOLTAR NO BROWSER E AINDA HAVER ALGUEM LOGADO
      this.authService.setUser(new User());

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
      this.user.password = ''; 
    }    
    
    
    public login(): void {
      
      this.timer = setInterval(this.reset.bind(this), 2500);
      if(!this.clickedOnce){
        this.clickedOnce = true;
        let usuario: User = new User();
        
        usuario = this.user;
        this.loginSubscription = this.authService.authenticate(this.user).subscribe((res) => {
          if(res != ''){
            let resObj = JSON.parse(res);
            usuario.jwt = resObj.accessToken;
            this.authService.setJWT(usuario.jwt);
            
            if(this.user.rememberMe){
              window.localStorage.setItem('JWTtoken', resObj.accessToken);
              window.localStorage.setItem('User', usuario.email);
            }
            
            this.getUserSubscription = this.authService.getUser(usuario.email).subscribe((res:User) => {
              if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(this.geolocationSuccess.bind(this),this.geolocationFailure.bind(this),
                {maximumAge:60000, timeout:5000, enableHighAccuracy:true} ); 
              } else {
                this.geolocationFailure();
              }
              this.authService.setUser(res, usuario.jwt);
              this.getConfigurationSubscription = this.configService.getConfiguration(usuario.email).subscribe((result: ConfigModel) => {
                  this.router.navigate(["/pages"])
              });
            });
          }
        }, (error) =>{
          this.messageService.error(this.messageService.getTranslation('DADOS_INVALIDOS'));
        });
        
      }      
      
    }    
    
    private reset(){
      this.clickedOnce = false;
    }
    
    
    /**
    * This callback gets the latitude and longitude from the position event triggered by the 'navigator.geolocation.getCurrentPosition(sucessCallBack, failureCallBack)' method.
    * Modifies a LoginComponent instanced object 'newUserAndGPS' via 'authService' a external service.
    * Sets the object latitude, longitude, user email and user password.
    *
    * @method geolocationSuccess
    * @param position {position} The position event instance to access.
    * @returns {void}
    * @public
    */
    public geolocationSuccess(position){
      let newUserAndGPS = new UserAndGPS();
      
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      
      newUserAndGPS.latitude = this.latitude.toString();
      newUserAndGPS.longitude = this.longitude.toString();
      
      
      newUserAndGPS.email = this.user.email;
      newUserAndGPS.password = this.user.password;
      
      this.setUserGPSSubscription = this.authService.setUserGPS(newUserAndGPS).subscribe();
      
    }
    
    public geolocationFailure(){
      // console.log('No GPS available in this browser.')
    }
    
    
    changeLanguage(event){
      this.messageService.setLanguage(event.toElement.id);
      window.localStorage.setItem('Language', event.toElement.id);
    }
    
    navigateTo(path: string) {
      this.router.navigate([path]);
    }
  }
  