import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements AfterViewInit {
    @ViewChild('editor') editor: any;  
    private editorConfig: any;
    
    ngAfterViewInit(): void {
        this.editor.ckeditorInit(this.editorConfig || {});
    }

    constructor(public editorTecladoService: EditorTecladoService){
        this.editorConfig = { height: 170, language: 'pt-br'};
    }

    config(){
        this.editor.ckeditorInit(this.editorConfig || {});
    }

    emitInstance($event){
        this.editorTecladoService.emitEditorInstance(this.editor.instance);
    }


}