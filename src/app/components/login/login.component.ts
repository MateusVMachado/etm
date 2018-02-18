import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.services';
import { JWTtoken } from '../../storage';
import { SwalComponent } from '@toverux/ngx-sweetalert2';
import 'rxjs/add/operator/catch';
import { CookieService } from 'ngx-cookie-service';


@Component({
    selector: 'nb-login',
    templateUrl: './login.component.html',
})

export class NgxLoginComponent implements OnInit{  

    @ViewChild('loginAlert') private loginAlert: SwalComponent;
    errors: string[] = [];
    messages: string[] = [];
    user: any = {};
    userInfo: any = {};

    constructor(protected service: AuthService,
                protected router: Router,
                private cookieService: CookieService){
    }

    ngOnInit(){
      
    }

    public login(): void {
        this.service.authenticate(this.user).catch((error) => {
          this.loginAlert.show();
          throw new Error('usuário ou senha inválido!');
        }).subscribe(
          (res: any) => {
              console.log(res['accessToken']);
              this.service.setToken(res['accessToken']);
              JWTtoken.token = res['accessToken'];
              if (JWTtoken.token !== undefined) {
                if (this.user.rememberMe) {
                     this.cookieService.set('token', JWTtoken.token);
                }
                this.router.navigate(['./pages/teclados']);
              }
          } ,  // changed
       );

    }

    navigateTo(path: string) {
      this.router.navigate([path]);
    }


}
