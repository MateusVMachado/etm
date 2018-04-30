import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import * as $ from 'jquery';
import { EditorTecladoService } from './editor-teclado.service';
import { SideBarService } from '../sidebar/sidebar.service';
import { TecladoService } from '../teclado/teclado.service';

@Component({
    selector: 'app-editor-component',
    templateUrl: './editor-teclado.component.html'
})
export class EditorTecladoComponent implements OnInit { 
    public tamanho: number;
    public initEditor: boolean;
    constructor(private editorTecladoService: EditorTecladoService, private sidebarService: SideBarService,
                private tecladoService: TecladoService) {        

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
        console.log("HELLO");
        console.log(JSON.stringify(event))
        //let split = document.getElementById('split')
        let split = $('[id=split]');
        console.log( $($(split)[0]).find('split-area')[0] );
        console.log( $($(split)[0]).find('split-area')[1] );

        // Esses dois valores devem ser salvos nas configurações do usuário
        let flexSup = $($(split)[0]).find('split-area')[0].style.flex;
        let flexUnd = $($(split)[0]).find('split-area')[1].style.flex;

        console.log("flexSup: " + flexSup + " flexUnd: " + flexUnd );
    }
}