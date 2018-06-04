import { Component, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import { GeneralConfigService } from '../general-config/general-config.service';
import { AuthService } from '../shared/services/auth.services';
import { SideBarService } from '../sidebar/sidebar.service';
import { TecladoService } from '../teclado/teclado.service';
import { EditorTecladoService } from './editor-teclado.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-editor-component',
    templateUrl: './editor-teclado.component.html'
})
export class EditorTecladoComponent implements OnInit, OnDestroy { 
    public tamanho: number;
    public initEditor: boolean;
    private subscribeToTecladoReadySubscription : Subscription

    constructor(private editorTecladoService: EditorTecladoService, private sidebarService: SideBarService,
        private tecladoService: TecladoService,
        private authService: AuthService,
        private generalConfigService: GeneralConfigService) {        
            
        }
        
        ngOnInit() { 
            this.initEditor = false;
            if(!this.initEditor){
                this.subscribeToTecladoReadySubscription = this.tecladoService.subscribeToTecladoReady().subscribe((ready: boolean) => {
                    this.initEditor = false;
                    if(ready){
                        let altura_teclado = $('#teclado').height();
                        let altura_resto = $(window).height() - altura_teclado;
                        $('#EditorTecladoContainer').css('max-height',$(window).height());
                        this.tamanho = $("#EditorTecladoContainer").height() - altura_teclado;
                        
                        if(! document.getElementById('ckeditor') ){
                            this.loadScript('../../assets/ckeditor/ckeditor.js', this.successCallback.bind(this));
                        } else {
                            this.successCallback();
                        }   
                    }        
                });
                this.callEvent(null);
                
            }
        }
        ngOnDestroy(){
            if(this.subscribeToTecladoReadySubscription) this.subscribeToTecladoReadySubscription.unsubscribe();
            
        }
        successCallback(){
            this.editorTecladoService.setHeight(this.tamanho);
            this.initEditor = true
        }
        
        
        loadScript(src, callback){
            let s,
            r,
            t;
            r = false;
            s = document.createElement('script');
            s.type = 'text/javascript';
            s.id = 'ckeditor';
            s.src = src;
            s.onload = s.onreadystatechange = function() {
                //console.log( this.readyState ); //uncomment this line to see which ready states are called.
                if ( !r && (!this.readyState || this.readyState == 'complete') )
                {
                    r = true;
                    callback();
                }
            };
            t = document.getElementsByTagName('script')[0];
            t.parentNode.insertBefore(s, t);
        }
        
        public callEvent(event){
            //console.log("HELLO");
            //console.log(JSON.stringify(event))
            //let split = document.getElementById('split')
            let split = $('[id=split]');
            // console.log( $(split)[0])
            //console.log( $($(split)[0]).find('split-area')[0] );
            //console.log( $($(split)[0]).find('split-area')[1] );
            
            // Esses dois valores devem ser salvos nas configurações do usuário
            let flexSup, flexUnd;
            if($($(split)[0]).find('split-area')[0].style.flex){
                flexSup = $($(split)[0]).find('split-area')[0].style.flex;
                flexUnd = $($(split)[0]).find('split-area')[1].style.flex;
            } else {
                flexSup = $($(split)[0]).find('split-area')[0].style.flexBasis;
                flexUnd = $($(split)[0]).find('split-area')[1].style.flexBasis;
            }
            
            if(flexSup.split(' ') === 1) flexSup = '1 1 ' + flexSup;
            if(flexUnd.split(' ') === 1) flexUnd = '1 1 ' + flexUnd;
            
            
            let user = this.authService.getLocalUser();
            
            
            
            
            // $('#split1').css('max-height',altura_resto);
            // $('#split2').css('min-height',altura_teclado);
            // console.log($(window).height());
            // console.log(altura_resto);
            // console.log(altura_teclado);
            
            
            let altura_geral = $(window).height()
            $('#EditorTecladoContainer').css('max-height',altura_geral);
            let altura_teclado = $('#teclado').height();
            let altura_resto = altura_geral - altura_teclado;


            this.tamanho = altura_resto;
            let editorWidth = $("#EditorTecladoContainer").width();
            let payload = [];
            
            payload.push(this.tamanho);
            payload.push(editorWidth);
            
            
            this.editorTecladoService.emitNewInstanceSize(payload);
            
            
            this.generalConfigService.updateFlexConfiguration(flexSup,flexUnd, user.email).subscribe();
            
        }
    }