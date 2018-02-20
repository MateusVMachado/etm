import { Component, EventEmitter, OnInit, Output, ViewChild, NgZone } from '@angular/core';
//import * as ckeditor from 'ckeditor';
import { EditorInstance } from '../../storage';
import { CKEditorComponent } from 'ng2-ckeditor';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    public testeVar: string = 'Uma string de teste';
    //public texto: string = 'Uma string de teste';
    constructor(){

    }

    ngOnInit(): void {
        EditorInstance.editor = this;    
    }



}