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
                    let editor = document.createElement('script');
                    editor.setAttribute('type', 'text/javascript');
                    editor.setAttribute('src', '../../assets/ckeditor/ckeditor.js')
                    document.getElementsByTagName('head').item(0).appendChild(editor);
                }
                
    ngOnInit() { 
        this.initEditor = false;
        if(!this.initEditor){
            this.tecladoService.subscribeToTecladoReady().subscribe((ready: boolean) => {
                this.initEditor = false;
                if(ready){
                    setTimeout(() => {
                        this.tamanho = ($("#EditorTecladoContainer").height()) - ($("#teclado").height());
                        this.editorTecladoService.setHeight(this.tamanho);
                        this.initEditor = true;
                    }, 200);
                }
            });
        }
    }
}