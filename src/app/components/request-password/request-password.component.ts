import { Component, HostListener, Injector, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import { isNullOrUndefined, isNumber } from 'util';
import { ProfileService } from '../profile/profile.service';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';

@Component({
  selector: 'nb-request-password-page',
  styleUrls: ['./request-password.component.scss'],
  templateUrl: './request-password.component.html',
})
export class RequestPasswordComponent extends AppBaseComponent implements OnInit, OnDestroy {
  
  submitted = false;
  user: User;
  firstStep : boolean = true;
  secondStep : boolean = false;
  newPassword : string = '';
  confPassword : string = '';
  codigoEmail : string = '';
  codigoEmailEnviado : string = '';
  erroEncontrarEmail : boolean = false;
  codigosDiferentes : boolean = false;
  countCodigos : number;
  blockedAccount : boolean;
  countBlocks : number;
  mostraModal : boolean
  
  private getUserSubscribe: Subscription;
  private isAccountBlockedSubscribe: Subscription;
  private updateUserPasswordSubscribe: Subscription;
  private sendEmailSubscribe: Subscription;
  private blockAccountSubscribe: Subscription;
  
  
  constructor(protected router: Router, protected authService: AuthService, protected profileService : ProfileService,
    private injector: Injector, private activatedRoute : ActivatedRoute) 
    {
      super(injector)
    }
    //AO CLICAR ESC O MODAL FECHA
    @HostListener('window:keyup', ['$event'])
    escEvent(event: KeyboardEvent) {
      if (event.keyCode === 27 && this.blockedAccount == false) {
        this.mostraModal = false;
      }
    }
    
    ngOnInit(){
      this.user = new User();
      this.mostraModal = false;
      this.countCodigos = 0;
      this.countBlocks = 0;
      $('#modal_btn').hide();
      
      let emailUrl = this.activatedRoute.snapshot.params["email"];
      if(!isNullOrUndefined(emailUrl) && emailUrl != ''){
        this.user.email = emailUrl;
        this.requestPass();
      }
    }
    ngOnDestroy(){
      if(this.getUserSubscribe) this.getUserSubscribe.unsubscribe();
      if(this.isAccountBlockedSubscribe) this.isAccountBlockedSubscribe.unsubscribe();
      if(this.updateUserPasswordSubscribe) this.updateUserPasswordSubscribe.unsubscribe();
      if(this.sendEmailSubscribe) this.sendEmailSubscribe.unsubscribe();
      if(this.blockAccountSubscribe) this.blockAccountSubscribe.unsubscribe();
    }
    requestPass(): void {
      if(!isNullOrUndefined(this.user.email) && this.user.email != ''){
        this.authService.getUser(this.user.email).subscribe((res:User) => {
          if(!isNullOrUndefined(res)){
            this.erroEncontrarEmail = false;
            this.user.password = btoa(res.password);
            this.user.jwt = res.jwt;
            this.secondStep = true;
            this.firstStep = false;
            this.codigoEmailEnviado = String( Math.round(Math.random()*100) ) + String( Math.round(Math.random()*100) ) + String( Math.round(Math.random()*100) );
            
            this.authService.isAccountBlocked(this.user.email).subscribe((result) =>{
              result = result["status"];
              if (result == 'false'){
                this.blockedAccount = false;
              }
              else if (result == 'true'){
                this.blockedAccount = true;
                $('#modal_mensagem').text(this.messageService.getTranslation('RECUPERAR_SENHA_MSG_BLOQUEADO'));
                $('#modal_mensagem_tempo').text(this.messageService.getTranslation('RECUPERAR_SENHA_REDIRECIONANDO'));
                this.mostraModal = true
                Observable.timer(5000).subscribe(()=> this.navigateTo('./auth/login'));
              }
              else{
                if(isNumber(result)){
                  this.countBlocks = Number(result);
                }
                else{
                  this.countBlocks = 0;
                }
                this.blockedAccount = false;
              }
              if(!this.blockedAccount){
                this.sendEmail();
              }
            });
          }
          else{
            this.erroEncontrarEmail = true;
          }
        });
      }
    }
    
    changePassword(){
      if(!this.blockedAccount){
        if(this.confPassword === this.newPassword){
          if(this.codigoEmail === this.codigoEmailEnviado){
            this.updateUserPasswordSubscribe = this.profileService.updateUserPassword(this.user.email,this.newPassword).subscribe(result =>{
              $('#modal_mensagem').text(this.messageService.getTranslation('RECUPERAR_SENHA_MSG_SENHA_ALTERADA'));
              $('#modal_mensagem_tempo').text('');
              $('#modal_btn').show();
              this.mostraModal = true;
              Observable.timer(15000).subscribe(()=> this.navigateTo('./auth/login'));
            });
          }
          else{
            this.codigosDiferentes = true;
            this.countCodigos += 1;
            if(this.countCodigos >= 5){
              this.blockedAccount = true;
              let desbloqueio : string;
              switch (this.countBlocks) {
                case 0:
                desbloqueio = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' ' + new Date(new Date().getTime()).toLocaleTimeString();
                break;
                case 1:
                desbloqueio = new Date(new Date().getTime() +  5*(24 * 60 * 60 * 1000)).toISOString().split('T')[0] + ' ' + new Date(new Date().getTime()).toLocaleTimeString();
                break;
                case 2:
                desbloqueio = new Date(new Date().getTime() +  30*(24 * 60 * 60 * 1000)).toISOString().split('T')[0] + ' ' + new Date(new Date().getTime()).toLocaleTimeString();
                break;
                case 3:
                desbloqueio = new Date(new Date().getTime() +  90*(24 * 60 * 60 * 1000)).toISOString().split('T')[0] + ' ' + new Date(new Date().getTime()).toLocaleTimeString();
                break;
                case 4:
                desbloqueio = new Date(new Date().getTime() +  365*(24 * 60 * 60 * 1000)).toISOString().split('T')[0] + ' ' + new Date(new Date().getTime()).toLocaleTimeString();
                break;
                default:
                desbloqueio = new Date(new Date().getTime() +  9999*(24 * 60 * 60 * 1000)).toISOString().split('T')[0] + ' ' + new Date(new Date().getTime()).toLocaleTimeString();
                break;
              }
              this.authService.blockAccount(this.user.email,desbloqueio).subscribe(result =>
                {
                  $('#modal_mensagem').text(this.messageService.getTranslation('RECUPERAR_SENHA_MSG_BLOQUEADO') + ' ' + this.messageService.getTranslation('RECUPERAR_SENHA_MSG_BLOQUEADO') );
                  $('#modal_mensagem_tempo').text( new Date(desbloqueio).toLocaleString() );
                  this.mostraModal = true;
                  Observable.timer(5000).subscribe(()=> this.navigateTo('./auth/login'));
                });
              }
            }
          }
        }
      }
      
      navigateTo(path: string) {
        this.router.navigate([path]);
      }
      
      sendEmail(){
        let emailTitulo : string = this.messageService.getTranslation('RECUPERAR_SENHA_EMAIL_TITULO');
        let emailAssunto : string = this.messageService.getTranslation('RECUPERAR_SENHA_EMAIL_ASSUNTO');
        let emailHostName : string = this.messageService.getTranslation('EMAIL_NOME_HOST');
        let modal_mensagem : string = this.messageService.getTranslation('RECUPERAR_SENHA_MSG_EMAIL_ENVIADO');
        let modal_mensagem_tempo : string = this.messageService.getTranslation('RECUPERAR_SENHA_MSG_EMAIL_ENVIADO_OBSERVACAO');
        this.sendEmailSubscribe = this.authService.sendEmail(this.user.email,emailHostName,emailTitulo,emailAssunto,this.getEmailBody()).subscribe(() =>
        {
          $('#modal_mensagem').text(modal_mensagem);
          $('#modal_mensagem_tempo').text(modal_mensagem_tempo);
          this.mostraModal = true
        });
      }
      
      getEmailBody(){
        let body : string = '';
        body ="<html>"
        body +="<head></head>"
        body +="<body  style='text-align:center;font-family:Roboto,sans-serif'>"
        body +="<h1>"+ this.messageService.getTranslation('RECUPERAR_SENHA_EMAIL_TITULO') +"</h1>"
        body +="<hr>"
        body +="<div style='padding: 2% 0'>"
        body +="<h3 style='font-weight:normal'>"+ this.messageService.getTranslation('RECUPERAR_SENHA_EMAIL_BODY') +"</h3>"
        body +="<h1 style='font-weight:bold; margin-top: 2%;'>"+ this.codigoEmailEnviado + "</h1>"
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