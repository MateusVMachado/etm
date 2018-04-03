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
        console.log("MARK-ET-1");
        this.initEditor = false;
        if(!this.initEditor){
            console.log("MARK-ET-2");
            this.tecladoService.subscribeToTecladoReady().subscribe((ready: boolean) => {
                console.log("MARK-ET-3");
                this.initEditor = false;
                if(ready){
                    console.log("MARK-ET-4");
                    setTimeout(() => {
                        console.log("MARK-ET-5");
                        this.tamanho = ($("#EditorTecladoContainer").height()) - ($("#teclado").height());
                        console.log("MARK-ET-6");
                        this.editorTecladoService.setHeight(this.tamanho);
                        console.log("MARK-ET-7");
                        this.initEditor = true
                        console.log("MARK-ET-8");
                    }, 200);
                    console.log("MARK-ET-9");
                }
                console.log("MARK-ET-10");
            });
            console.log("MARK-ET-11");
        }
    }
}