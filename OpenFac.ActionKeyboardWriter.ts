import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';
import { ElementRef, ViewChild } from '@angular/core';

//import * as jquery from 'jquery';
import * as $ from 'jquery'; window["$"] = $; window["jQuery"] = $;

export class OpenFacActionKeyboardWriter implements IOpenFacAction {    
    @ViewChild('ckEditor') elRef: ElementRef;
    public cursorPosition: number = 0;
    public selection: any;
    public range: any;

    constructor(private editor: any){        
        this.selection = this.editor.getSelection();
        this.range = this.selection.getRanges()[0];
    }

    public Execute(Engine: IOpenFacEngine){
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        this.editor.focus();
        this.cursorPosition += 1;
        this.doGetCaretPosition();
        switch (bt.Text) {
            case '*kbdrtrn':
                this.editor.insertHtml('<br>');

                break;
            case '*bckspc':
                this.backspaceKey();

                break;
            case '*tab':
                for(let i = 0; i < 4; i++)  this.editor.insertHtml('&nbsp;');

                break;
            case '*cpslck':
                // do something
                break;
            case '*arrowup':
                // do something
                break;
            case '*arrowdown':
                // do something
                break;
            case '*arrowleft':
                // do something
                break;
            case '*arrowright':
                // do something
                break;
            case '1':
                // do something
                this.setCaretPosition(3);
                break;    
            case '*space':
                this.editor.insertHtml('&nbsp;');

                break;                                   
            default:
                this.editor.insertText(bt.Text);

                break;
        }
/*
        //if(bt.Text === '*bckspc'){
        if(bt.Text === '1'){
            //this.editor.execCommand( 'columnDelete' );
            this.backspaceKey();
        } else {
            
            this.doGetCaretPosition (this.editor);
            this.editor.insertText(bt.Text);
        }
 */       
    }

    public setCaretPosition(pos) {
        this.editor.focus();
        let sel = this.editor.getSelection();
        let element = sel.getStartElement();
        sel.selectElement(element);
        let ranges = this.editor.getSelection().getRanges();
        ranges[0].setStart(element, pos);
        ranges[0].setEnd(element, pos); //cursor
        sel.selectRanges([ranges[0]]);
        this.editor.focus();
     }


    public backspaceKey(){
        this.editor.focus();
        let sel = this.editor.getSelection();
        let element = sel.getStartElement();
        sel.selectElement(element);
        let ranges = this.editor.getSelection().getRanges();
        ranges[0].setStart(element, this.cursorPosition-2);
        ranges[0].setEnd(element, this.cursorPosition-1); //cursor
        sel.selectRanges([ranges[0]]);
        this.editor.insertText('');
  
    }

    public doGetCaretPosition() {
        let selection = this.editor.getSelection();
        let range = selection.getRanges()[0];
        let cursor_position = range.startOffset + 1;
        this.cursorPosition = cursor_position;
        console.log(cursor_position);
    }
    
}