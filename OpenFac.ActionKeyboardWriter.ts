import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';
import { ElementRef, ViewChild, Injectable, NgZone } from '@angular/core';
import { OpenFacKeyCommandService } from './OpenFac.KeyCommand.service';


@Injectable()
export class OpenFacActionKeyboardWriter implements IOpenFacAction {    
    @ViewChild('ckEditor') elRef: ElementRef;
    public cursorPosition: number = 0;
    public selection: any;
    public range: any;

    constructor(private editor: any, public keyCommandService: OpenFacKeyCommandService, private zone: NgZone){        
        this.selection = this.editor.getSelection();
        this.range = this.selection.getRanges()[0];
    }

    public Execute(Engine: IOpenFacEngine){
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        this.editor.focus();
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
                    //this.tecladoComponent.capsLock();
                    this.zone.run(() =>{
                            this.keyCommandService.emitKeyCommand('caps');
                      })
                    //this.keyCommandService.emitKeyCommand(this.editor.instance);
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
                this.backspaceKey();
                //this.setCaretPosition(3);
                break;    
            case '*space':
                this.editor.insertHtml('&nbsp;');

                break;                                   
            default:
                this.editor.insertText(bt.Text);
                //this.cursorPosition += 1;      
                break;
        }
      
    }


    public backspaceKey(){
        //this.cursorPosition = this.cursorPosition-1;

        this.editor.focus();
        let sel = this.editor.getSelection();
        let element = sel.getStartElement();
        if(element){
            sel.selectElement(element);  
        } else {
            return
        }
        let ranges = this.editor.getSelection().getRanges();
        if(this.cursorPosition-2 < 0) return;
        ranges[0].setStart(element, this.cursorPosition-2);
        ranges[0].setEnd(element, this.cursorPosition-1); //cursor
        if([ranges[0]]){
            sel.selectRanges([ranges[0]]);
        } else {
            return;
        } 
        this.editor.insertText('');
    }

    public doGetCaretPosition() {
        let selection = this.editor.getSelection();
        let range = selection.getRanges()[0];
        this.cursorPosition = range.startOffset + 1;
        console.log(this.cursorPosition);
    }


    public setCaretPosition(pos) {
        this.editor.focus();
        let sel = this.editor.getSelection();
        let element = sel.getStartElement();
        if(element){
            sel.selectElement(element);  
        } else {
            return
        }
        let ranges = this.editor.getSelection().getRanges();
        ranges[0].setStart(element, pos);
        ranges[0].setEnd(element, pos); //cursor
        if([ranges[0]]){
            sel.selectRanges([ranges[0]]);
        } else {
            return;
        }  
        this.editor.focus();
     }
    
}