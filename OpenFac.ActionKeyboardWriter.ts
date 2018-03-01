import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';
import { OpenFacKeyCommandService } from './OpenFac.KeyCommand.service';


export class OpenFacActionKeyboardWriter implements IOpenFacAction {    
    public cursorPosition: number = 0;
    public selection: any;
    public range: any;
    public editor: any;
    public keyCommandService: any;
    public zone: any;
    private maxLength: number = 1;
    //constructor(private editor: any, public keyCommandService: OpenFacKeyCommandService, private zone: NgZone){        
    constructor(private args: any){
        this.editor = this.args[0];
        this.keyCommandService = this.args[1];
        this.zone = this.args[2];

        this.selection = this.editor.getSelection();
        this.range = this.selection.getRanges()[0];
    }

    public Execute(Engine: IOpenFacEngine){
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        this.editor.focus();

        switch (bt.Text) {
            case '*kbdrtrn':
                this.editor.insertHtml('<br>');
                this.maxLength += 1;
                this.doGetCaretPosition();
                break;
            case '*bckspc':
                this.backspaceKey();
                this.maxLength -= 1;
                this.doGetCaretPosition();
                break;
            case '*tab':
                for(let i = 0; i < 4; i++)  this.editor.insertHtml('&nbsp;');
                this.maxLength += 1;
                this.doGetCaretPosition();
                break;
            case '*cpslck':
                this.keyCommandService.emitKeyCommand('caps');
                break;
            case '*arrowup':
                // do something
                break;
            case '*arrowdown':
                // do something
                break;
            case '*arrowleft':
                let toGoBackward = this.doGetCaretPosition(true)-2;
                if(toGoBackward >= 0){
                    this.setCaretPosition(toGoBackward);
                }
                this.doGetCaretPosition();
                // do something
                break;
            case '*arrowright':
                let toGoForward = this.doGetCaretPosition(true);
                console.log(toGoForward);
                if(toGoForward < this.maxLength) this.setCaretPosition(toGoForward);
                this.doGetCaretPosition();
                // do something
                break;
            case '*space':
                this.editor.insertHtml('&nbsp;');      
                this.maxLength += 1;
                this.doGetCaretPosition();
                break;                                   
            default:
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
        //console.log("this.cursorPosition-2: " + (this.cursorPosition-2).toString() );
        //console.log("this.cursorPosition-1: " + (this.cursorPosition-1).toString() );
        console.log("maxLength: " + this.maxLength);
        //console.log("start: " + 
        //            (this.cursorPosition-(this.maxLength-(this.cursorPosition-2))-1).toString() );
        //console.log("end: " + 
        //            (this.cursorPosition-(this.maxLength-(this.cursorPosition-1))-1).toString() );

        this.editor.focus();
        let selection = this.editor.getSelection();
        let range = selection.getRanges()[0];
        this.cursorPosition = range.startOffset + 1;
        //if(this.cursorPosition > this.maxLength) {
        //    this.maxLength = this.cursorPosition;
        //}
        console.log(this.cursorPosition);
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