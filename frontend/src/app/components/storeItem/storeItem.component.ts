import { Component, EventEmitter, Injector, Input, OnInit, Output, OnDestroy } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { isNullOrUndefined, isUndefined } from "util";
import { OpenFACLayout } from "../layout-editor/layout.model";
import { AppBaseComponent } from "../shared/components/app-base.component";
import { TecladoCompartilhadoModel } from "../shared/models/teclado_compartilhado";
import { User } from "../shared/models/user";
import { AuthService } from "../shared/services/auth.services";
import { TecladoCompartilhadoService } from "../shared/services/teclado_compartilhado.service";
import { TecladoService } from "../teclado/teclado.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-store-item',
    templateUrl: './storeItem.component.html',
    styleUrls: ['./storeItem.component.css']
})
export class StoreItemComponent extends AppBaseComponent implements OnInit, OnDestroy {
    
    @Output() modalUsar = new EventEmitter<any[]>()
    @Output() modalCompartilhar = new EventEmitter<any[]>()
    @Input("tecCompart") tecladoCompartilhado : TecladoCompartilhadoModel
    usuario : User
    teclado : OpenFACLayout
    carregado = false;
    estrelas = [1,2,3,4,5]
    
    imgUsuario : string
    msg_avaliado : string
    visualizado = false;

    private getUsuarioSubscription : Subscription
    private getTecladoSubscription : Subscription
    private setTecladoVisualizadoSubscription : Subscription
    private getJaAvaliouSubscription : Subscription
    
    constructor(private tecladoCompartilhadoService : TecladoCompartilhadoService,
        private tecladoService : TecladoService,
        private authService : AuthService, private formBuilder : FormBuilder,
        protected injector: Injector){super(injector)}
        
        ngOnInit() {
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
            this.usuario = new User();
            this.getTeclado(this.tecladoCompartilhado.usuarioEmail, this.tecladoCompartilhado.nameLayout)
            this.getUsuario(this.tecladoCompartilhado.usuarioEmail)
        }
        ngOnDestroy(){
            if(this.getTecladoSubscription) this.getTecladoSubscription.unsubscribe();
            if(this.getUsuarioSubscription) this.getUsuarioSubscription.unsubscribe();
            if(this.setTecladoVisualizadoSubscription) this.setTecladoVisualizadoSubscription.unsubscribe();
            if(this.getJaAvaliouSubscription) this.getJaAvaliouSubscription.unsubscribe();
        }
        private getUsuario(email : string){
            this.getUsuarioSubscription = this.tecladoCompartilhadoService.getUsuario(email)
            .subscribe(result => {
                if(!isNullOrUndefined(result)){
                    this.usuario.fullName = result["fullName"] || 'Usuário não Encontrado';
                    this.usuario.picture = result["picture"];
                    this.usuario.email = result["email"];
                    if (this.usuario.picture["content"]){
                        this.imgUsuario = 'data:image/png;base64,'+ this.usuario.picture["content"];
                    }
                }
            });
        }
        
        private getTeclado(email : string, nameLayout : string){
            if(this.getTecladoSubscription) this.getTecladoSubscription.unsubscribe();
            this.getTecladoSubscription = this.tecladoService.loadSingleKeyboard(nameLayout,email,this.usuario.jwt)
            .subscribe((result : OpenFACLayout) => {
                this.teclado = result[0];
                this.carregado = true;
            });
        }
        
        avalie(nota : string){
            let usuarioAvaliador : User = this.authService.getLocalUser();
            if(!isUndefined(this.getJaAvaliouSubscription)) this.getJaAvaliouSubscription.unsubscribe();
            this.getJaAvaliouSubscription = this.tecladoCompartilhadoService.getJaAvaliou(this.tecladoCompartilhado.id,usuarioAvaliador.email,nota)
            .subscribe(result =>{
                let jaAvaliou : boolean;
                jaAvaliou = result["value"];
                if(!jaAvaliou){
                    this.msg_avaliado = this.messageService.getTranslation('STORE_ITEM_AVALIOU_TECLADO') + " " + nota;
                    this.tecladoCompartilhado.numeroAvaliacoes += 1;
                    if(this.tecladoCompartilhado.numeroAvaliacoes - 1 > 0){
                        this.tecladoCompartilhado.nota = (this.tecladoCompartilhado.nota * (this.tecladoCompartilhado.numeroAvaliacoes-1) + Number(nota)) / this.tecladoCompartilhado.numeroAvaliacoes
                    } 
                    else{
                        this.tecladoCompartilhado.nota = Number(nota);
                    }
                }
                else{
                    this.msg_avaliado = this.messageService.getTranslation('STORE_ITEM_JA_AVALIOU_TECLADO');
                }
            });
            if(!this.visualizado){
                this.setTecladoVisualizadoSubscription = this.tecladoCompartilhadoService.setTecladoVisualizado(this.tecladoCompartilhado.id).subscribe();
                this.visualizado = true;
            }
        }
        
        showModalUse(){
            if(!this.visualizado){
                this.setTecladoVisualizadoSubscription = this.tecladoCompartilhadoService.setTecladoVisualizado(this.tecladoCompartilhado.id).subscribe();
                this.visualizado = true;
            }
            this.modalUsar.emit([this.teclado,this.tecladoCompartilhado.nameLayout,this.tecladoCompartilhado.id]);
        }
        
        showModalCompartilhe(){
            if(!this.visualizado){
                this.setTecladoVisualizadoSubscription = this.tecladoCompartilhadoService.setTecladoVisualizado(this.tecladoCompartilhado.id).subscribe();
                this.visualizado = true;
            }
            this.modalCompartilhar.emit([this.tecladoCompartilhado.id,this.teclado]);
        }
    }