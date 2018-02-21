import { Component, EventEmitter, OnInit, Output, ViewChild, NgZone, Input, ElementRef } from '@angular/core';
//import * as ckeditor from 'ckeditor';
import { EditorInstance } from '../../storage';
import { CKEditorComponent } from 'ng2-ckeditor';
import { MainTextEditor } from '../../storage';
import { DataService } from '../shared/data.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    @ViewChild('editor') editor: any;
    public testeVar: string = 'Uma string de teste';
    public frame: any;
    @Input() public texto: string;

    @Output() public EditorInstanceEvent = new EventEmitter<any>();

    constructor(public dados: DataService){
    }

    ngOnInit(): void {

    }

    emitInstance($event){
        console.log('EMITIU');
        this.dados.changeMessage(this.editor.instance);
    }

}