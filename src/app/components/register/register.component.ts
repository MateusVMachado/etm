/**
* @license
* Copyright Akveo. All Rights Reserved.
* Licensed under the MIT License. See License.txt in the project root for license information.
*/
import { Component, Injector, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/catch';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nb-register',
  styleUrls: ['./register.component.scss'],
  templateUrl: './register.component.html',
})

export class RegisterComponent extends AppBaseComponent implements OnDestroy {
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
  termsCheckbox : any
  
  private sendEmailSubscribe: Subscription;
  
  constructor(protected authService: AuthService, protected router: Router, injector: Injector) { 
    super(injector) 
  }
  ngOnDestroy(){
    if(this.sendEmailSubscribe) this.sendEmailSubscribe.unsubscribe();
  }
  
  public register() {
    let usuario: User = new User();
    usuario = this.user;
    this.authService.register(usuario).subscribe(
      (res: any) => {
        let message = this.messageService.getTranslation('MENSAGEM_CADASTRO_CONCLUIDO');
        this.messageService.success(message).then(res => {
          this.sendEmail();
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
  
  sendEmail(){
    let emailTitulo : string = this.messageService.getTranslation('BOAS_VINDAS_EMAIL_TITULO');
    let emailHostName : string = this.messageService.getTranslation('EMAIL_NOME_HOST');
    
    this.sendEmailSubscribe = this.authService.sendEmail(this.user.email,emailHostName,emailTitulo,emailTitulo,this.getEmailBody()).subscribe(() =>
    {
      this.router.navigate(['./auth/login']);
    });
  }
  
  getEmailBody(){
    let body : string = '';
    body ="<html>"
    body +="<head></head>"
    body +="<body  style='text-align:center;font-family:Roboto,sans-serif'>"
    body +="<h1>"+ this.messageService.getTranslation('BOAS_VINDAS_EMAIL_TITULO') +"</h1>"
    body +="<hr>"
    body +="<div style='padding: 2% 0'>"
    body +="<h3 style='font-weight:normal'>"+ this.messageService.getTranslation('BOAS_VINDAS_EMAIL_TITULO') +"</h3>"
    body +="<h3 style='font-weight:normal'>"+ this.messageService.getTranslation('BOAS_VINDAS_EMAIL_BODY_MSG') +"</h3>"
    body +="</div>"
    body +="<footer style='padding: 2% 1%; background-color: #364150; color: #fff; text-shadow: 1px 1px 1px #000';>"
    body +="<h4>" + this.messageService.getTranslation('EMAIL_OBRIGADO') + "</h4>"
    body +="<h4>" + this.messageService.getTranslation('EMAIL_EQUIPE') + "</h4>"
    body +="</footer>"
    body +="</body>"
    body +="</html>"
    
    return body;
  }
}
