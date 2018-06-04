import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements AfterViewInit {
    @ViewChild('editor') editor: any; 
    @Input('tamanho') tamanhoDiv: number;
   
    public editorConfig: any;
    private height: number;

    ngOnInit(){
        this.editorTecladoService.getHeight().subscribe((tamanho)=>{
                this.editorConfig = { height: (tamanho - 140), removePlugins: 'elementspath'};
                $('#editorContainer').css('height',tamanho-140);
        });
    }
    
    ngAfterViewInit(): void { }

    constructor(public editorTecladoService: EditorTecladoService){
    }


    emitInstance($event){
        this.editorTecladoService.emitEditorInstance(this.editor.instance);
    }



}