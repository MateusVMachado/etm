import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';
import { OpenFacKeyCommandService } from './OpenFac.KeyCommand.service';
import { KeyboardWriterService } from './OpenFAc.KeyboardWriterService';

export class OpenFacActionKeyboardWriter implements IOpenFacAction {    
    public cursorPosition: number = 0;
    public selection: any;
    public range: any;
    public editor: any;
    public keyCommandService: any;
    public zone: any;
    private maxLength: number = 1;
    private keyboardWriterService: KeyboardWriterService = new KeyboardWriterService();

    private tabs: Map<number, boolean> = new Map<number, boolean>()
      
    constructor(private args: any){
        this.editor = this.args[0];
        this.keyCommandService = this.args[1];
        this.zone = this.args[2];

        this.selection = this.editor.getSelection();
        if(this.selection){
            this.range = this.selection.getRanges()[0];
        }
    }

    public Execute(Engine: IOpenFacEngine){
        if(this.editor === null) return;
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        this.editor.focus();

        switch (bt.Text) {
            case '*kbdrtrn':
                this.editor.focus();
                this.editor.insertHtml('<br>');
                this.maxLength += 1;
                this.doGetCaretPosition();
                break;
            case '*bckspc':
                this.editor.focus();
                if ( this.tabs.get(this.cursorPosition) ){
                    for(let i = 0; i < 4; i++){
                        this.backspaceKey();
                        this.maxLength -= 1;
                        this.doGetCaretPosition();
                        this.tabs.delete(this.cursorPosition);
                    }
                } else {
                    this.backspaceKey();
                    this.maxLength -= 1;
                    this.doGetCaretPosition();
                }
                break;
            case '*tab':
                this.editor.focus();
                for(let i = 0; i < 4; i++) {
                    this.editor.insertHtml('&nbsp;');                    
                    this.maxLength += 1;
                    this.doGetCaretPosition();
                    
                } 
                this.tabs.set(this.cursorPosition, true);
                this.tabs.set(this.cursorPosition-3, true);
                break;
            case '*cpslck':
                this.editor.focus();
                this.keyCommandService.emitKeyCommand('caps');
                break;
            case '*arrowup':
                // do something
                break;
            case '*arrowdown':
                // do something
                break;
            case '*arrowleft':
            if ( this.tabs.get(this.cursorPosition) ){
                for(let i = 0; i < 4; i++){
                    this.editor.focus();
                    let toGoBackward = this.doGetCaretPosition(true)-2;
                    if(toGoBackward >= 0){
                        this.setCaretPosition(toGoBackward);
                    }
                    this.doGetCaretPosition();
                }
            } else {
                this.editor.focus();
                let toGoBackward = this.doGetCaretPosition(true)-2;
                if(toGoBackward >= 0){
                    this.setCaretPosition(toGoBackward);
                }
                this.doGetCaretPosition();
            }
                // do something
                break;
            case '*arrowright':
            if ( this.tabs.get(this.cursorPosition) ){
                for(let i = 0; i < 4; i++){
                    this.editor.focus();
                    let toGoForward = this.doGetCaretPosition(true);
                    if(toGoForward < this.maxLength) this.setCaretPosition(toGoForward);
                    this.doGetCaretPosition();
                }
            } else {
                this.editor.focus();
                let toGoForward = this.doGetCaretPosition(true);
                if(toGoForward < this.maxLength) this.setCaretPosition(toGoForward);
                this.doGetCaretPosition();
            }    
                // do something
                break;
            case '*space':
                this.editor.focus();
                this.editor.insertHtml('&nbsp;');      
                this.maxLength += 1;
                this.doGetCaretPosition();
                break;                                   
            default:
                this.editor.focus();
                this.editor.insertText(bt.Text);
                this.maxLength += 1;
                this.doGetCaretPosition();
                break;
        }
      
    }


    public backspaceKey(){
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
        this.editor.insertHtml('');
    }

    public doGetCaretPosition(toReturn?:boolean) {
        this.editor.focus();
        let selection = this.editor.getSelection();
        if(selection !== null) { 
            let range = selection.getRanges()[0];
            this.cursorPosition = range.startOffset + 1;
        }    
        if(toReturn) return this.cursorPosition;
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