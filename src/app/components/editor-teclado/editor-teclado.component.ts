import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { EditorTecladoService } from './editor-teclado.service';
import { SideBarService } from '../sidebar/sidebar.service';
import { TecladoService } from '../teclado/teclado.service';
import { AuthService } from '../shared/services/auth.services';
import { GeneralConfigService } from '../general-config/general-config.service';

@Component({
    selector: 'app-editor-component',
    templateUrl: './editor-teclado.component.html'
})
export class EditorTecladoComponent implements OnInit { 
    public tamanho: number;
    public initEditor: boolean;
    constructor(private editorTecladoService: EditorTecladoService, private sidebarService: SideBarService,
                private tecladoService: TecladoService,
                private authService: AuthService,
                private generalConfigService: GeneralConfigService) {        

                }
                
    ngOnInit() { 
        this.initEditor = false;
        if(!this.initEditor){
            this.tecladoService.subscribeToTecladoReady().subscribe((ready: boolean) => {
                this.initEditor = false;
                if(ready){
                        this.tamanho = ($("#EditorTecladoContainer").height()) - ($("#teclado").height());

                        if(! document.getElementById('ckeditor') ){
                            this.loadScript('../../assets/ckeditor/ckeditor.js', this.successCallback.bind(this));
                        } else {
                            this.successCallback();
                        }   
                }        
            });

        }
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
        console.log( $(split)[0])
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

        this.tamanho = ($("#EditorTecladoContainer").height()) - ($("#teclado").height());
        let editorWidth = $("#EditorTecladoContainer").width();
        let payload = [];

        payload.push(this.tamanho);
        payload.push(editorWidth);
        
    
        this.editorTecladoService.emitNewInstanceSize(payload);


        this.generalConfigService.updateFlexConfiguration(flexSup,flexUnd, user.email).subscribe();

    }
}