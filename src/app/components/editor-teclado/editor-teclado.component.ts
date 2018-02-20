import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-editor-component',
    templateUrl: './editor-teclado.component.html'
})
export class EditorTecladoComponent implements OnInit {
    @Input() public textArea: any; 
    public outValue: any;
    constructor() { }

    ngOnInit() { }
    
    public receiveEvent($event){
        this.textArea = $event;
        this.outValue = $event;
      }
}