import { IOpenFacAction } from './OpenFac.Action.Interface';
import { OpenFacEngine } from './OpenFac.Engine';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { KeyboardWriterService } from './OpenFAc.KeyboardWriterService';

export class OpenFacActionKeyboardWriter implements IOpenFacAction {
    //public cursorPosition: number = 0;
    public cursorPosition: number;
    public maxLength: number;

    public selection: any;
    public range: any;
    public editor: any;
    public keyCommandService: any;
    public zone: any;
    //private maxLength: number = 1;
    private keyboardWriterService: KeyboardWriterService = new KeyboardWriterService();

    private predictor: any;

    private tabs: Map<number, boolean> = new Map<number, boolean>()

    // this only exists so that I don't have to create 50 cases below
    private alpha = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ç',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ç'
    ]

    constructor(private args: any){
        this.editor = this.args[0];
        this.keyCommandService = this.args[1];
        this.zone = this.args[2];
        this.cursorPosition = this.args[3];
        this.maxLength = this.args[4];
        this.predictor = this.args[5];

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
                this.predictor.clearCurrentWordOnly();
                break;

            case '*bckspc':
                this.editor.focus();
                if ( this.tabs.get(this.cursorPosition) ){
                    for(let i = 0; i < 4; i++){
                        if (this.backspaceKey()) {
                            this.doGetCaretPosition(false, -1);
                        }
                        this.tabs.delete(this.cursorPosition);
                    }
                } else {
                    if (this.backspaceKey()) {
                        this.doGetCaretPosition(false, -1);
                    }
                }
                this.predictor.clearCurrentWordOnly();
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
                this.predictor.clearCurrentWordOnly();
                break;
            case '*cpslck':
                this.editor.focus();
                this.keyCommandService.emitKeyCommand('caps');
                this.predictor.clearCurrentWordOnly();
                break;
            case '*arrowup':
                // do something
                this.predictor.clearCurrentWordOnly();
                break;
            case '*arrowdown':
                // do something
                this.predictor.clearCurrentWordOnly();
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
                this.predictor.clearCurrentWordOnly();
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
            this.predictor.clearCurrentWordOnly();
                // do something
                break;
            case '*space':
                this.editor.focus();
                this.editor.insertHtml('&nbsp;');
                this.maxLength += 1;
                this.doGetCaretPosition(false,1);
                this.predictor.clearCurrentWordOnly();
                break;
            case 'SPACE':
                this.editor.focus();
                this.editor.insertHtml('&nbsp;');
                this.maxLength += 1;
                this.doGetCaretPosition(false,1);
                this.predictor.clearCurrentWordOnly();
                break;
            case 'PULA':
                this.editor.focus();
                this.editor.insertText('');
                this.doGetCaretPosition();
                break;
                
                
                
            case '*SUGGESTION0' :
            case '*SUGGESTION1' :
            case '*SUGGESTION2' :
            case '*SUGGESTION3' :
            case '*SUGGESTION4' :

              let index = Number(bt.Text.substring(11));
              let wordsArray = this.predictor.getWordsArray();
              let realText = wordsArray[index];

              if(realText !== '') {

                let toInsert = realText.replace(this.predictor.currentWord, '');

                this.editor.focus();
                this.editor.insertText(toInsert);
                this.editor.insertHtml('    ');
                this.maxLength = this.maxLength + toInsert.length + 1;
                this.doGetCaretPosition(false, toInsert.length + 1);
                this.predictor.wordPicked(realText);

              }
            break;
            case '*CLEAR_SUGGESTIONS':
              this.clearWordAndPredictor();
            break;
            default:
                
              if (this.alpha.indexOf(bt.Text) !== -1) {
                this.editor.focus();
                this.editor.insertText(bt.Text);
                this.maxLength += 1;
                this.doGetCaretPosition(false, bt.Text.length);
                this.predictor.addCharacterAndPredict(bt.Text);
              } else {
                this.editor.focus();
                this.editor.insertText(bt.Text);
                this.maxLength += 1;
                this.doGetCaretPosition(false, bt.Text.length);
                this.clearWordAndPredictor();
              }
            break;
              
              
              
              
        }

    }

    public clearWordAndPredictor() {
      this.predictor.clear();
    }
    
    


    public backspaceKey(): boolean{
        if(this.cursorPosition <= 0) return false;
        this.editor.focus();
        let sel = this.editor.getSelection();
        if(sel){
            let element = sel.getStartElement();
            if(element){
                sel.selectElement(element);
            } else {
                return false;
            }
            let ranges = this.editor.getSelection().getRanges();
            

            if(ranges){
                ranges[0].setStart(element, this.cursorPosition-1); // issue here (no child at offset x)
                ranges[0].setEnd(element, this.cursorPosition); //cursor

                if([ranges[0]]){
                    sel.selectRanges([ranges[0]]);
                } else {
                    return false;
                }
            }
            this.editor.insertHtml('');
            this.maxLength -= 1;
        }
        return true;
    }

    public doGetCaretPosition(toReturn?: boolean, delta: number = 1) {
        this.editor.focus();
        let selection = this.editor.getSelection();
        if(selection !== null) {
            this.cursorPosition += delta;
        }
        if(toReturn) return this.cursorPosition;
    }


    public setCaretPosition(pos) {
        this.editor.focus();
        let sel = this.editor.getSelection();
        if(sel){
            let element = sel.getStartElement();
            if(element){
                sel.selectElement(element);
            } else {
                return
            }

            let ranges = this.editor.getSelection().getRanges();
            if(ranges){
                ranges[0].setStart(element, pos);
                ranges[0].setEnd(element, pos); //cursor
                if([ranges[0]]){
                    sel.selectRanges([ranges[0]]);
                } else {
                    return;
                }
            }
        }
        this.editor.focus();
    }

}
