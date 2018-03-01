import { Component, ViewChild, AfterViewInit, Input } from '@angular/core';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import * as $ from 'jquery';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements AfterViewInit {
    @ViewChild('editor') editor: any; 
    @Input('tamanho') tamanhoDiv: number;
   
    private editorConfig: any;
    private height: number;

    ngOnInit(){
        let dif = ($(".editorContainer").height()) - this.tamanhoDiv;
        console.log(this.tamanhoDiv)
        let height: number = ($(".editorContainer").height() - dif);
        console.log("editor: " + height)
        this.editorConfig = { height: height};
    }
    
    ngAfterViewInit(): void {
    }

    constructor(public editorTecladoService: EditorTecladoService){
    }


    emitInstance($event){
        this.editorTecladoService.emitEditorInstance(this.editor.instance);
    }


}