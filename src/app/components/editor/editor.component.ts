import { Component, EventEmitter, OnInit, Output, ViewChild, NgZone, Input } from '@angular/core';
//import * as ckeditor from 'ckeditor';
import { EditorInstance } from '../../storage';
import { CKEditorComponent } from 'ng2-ckeditor';
import { MainTextEditor } from '../../storage';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    public testeVar: string = 'Uma string de teste';
    @Input() public texto: string;

    @Output() public EditorInstanceEvent = new EventEmitter<any>();

    constructor(){
    }

    ngOnInit(): void {

        this.EditorInstanceEvent.emit(document.getElementById('ckEditor').childNodes.item(0) );

    }

}