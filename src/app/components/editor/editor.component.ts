import { Component, EventEmitter, OnInit, Output, ViewChild, NgZone, Input, ElementRef } from '@angular/core';
//import * as ckeditor from 'ckeditor';
import { EditorInstance } from '../../storage';
import { CKEditorComponent } from 'ng2-ckeditor';
import { MainTextEditor } from '../../storage';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    
    @ViewChild('editor') editor: any;   

    constructor(public editorTecladoService: EditorTecladoService){
    }

    ngOnInit(): void {

    }

    emitInstance($event){
        this.editorTecladoService.emitEditorInstance(this.editor.instance);
    }

}