import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import * as $ from 'jquery';

@Component({
    selector: 'app-editor-component',
    templateUrl: './editor-teclado.component.html'
})
export class EditorTecladoComponent implements OnInit { 
    public tamanho: number;    
    constructor() { }

    ngOnInit() { 
        console.log($("#EditorTecladoContainer").height());
        console.log($("#teclado").height());
        console.log("div: " + $("#editor").height());
        this.tamanho = $("#editor").height();
    }

}