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
                this.clearWordAndPredictor();
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
                    //this.maxLength -= 1;
                    this.doGetCaretPosition();
                }
                this.clearWordAndPredictor();
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
                this.clearWordAndPredictor();
                break;
            case '*cpslck':
                this.editor.focus();
                this.keyCommandService.emitKeyCommand('caps');
                this.clearWordAndPredictor();
                break;
            case '*arrowup':
                // do something
                this.clearWordAndPredictor();
                break;
            case '*arrowdown':
                // do something
                this.clearWordAndPredictor();
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
                this.clearWordAndPredictor();
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
            this.clearWordAndPredictor();
                // do something
                break;
            case '*space':
                this.editor.focus();
                this.editor.insertHtml('&nbsp;');
                this.maxLength += 1;
                this.doGetCaretPosition(false,' ');
                this.clearWordAndPredictor();
                break;
            case 'SPACE':
                this.editor.focus();
                this.editor.insertHtml('&nbsp;');
                this.maxLength += 1;
                this.doGetCaretPosition(false,' ');
                this.clearWordAndPredictor();
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
                this.editor.insertHtml('&nbsp;');
                this.maxLength = this.maxLength + toInsert.length + 1;
                this.doGetCaretPosition(false, toInsert);
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
                this.doGetCaretPosition(false, bt.Text);
                this.predictor.addCharacterAndPredict(bt.Text);
              } else {
                this.editor.focus();
                this.editor.insertText(bt.Text);
                this.maxLength += 1;
                this.doGetCaretPosition(false, bt.Text);
                this.clearWordAndPredictor();
              }
            break;
        }
    }

    public clearWordAndPredictor() {
      this.predictor.clear();
    }


    public backspaceKey(){
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
            if(this.cursorPosition-2 < 0) return;

            if(ranges){
                ranges[0].setStart(element, this.cursorPosition-2);
                ranges[0].setEnd(element, this.cursorPosition-1); //cursor

                if([ranges[0]]){
                    sel.selectRanges([ranges[0]]);
                } else {
                    return;
                }
            }
            this.editor.insertHtml('');
        }
    }

    public doGetCaretPosition(toReturn?:boolean, bt?:string) {
        this.editor.focus();
        let selection = this.editor.getSelection();
        if(selection !== null) {
            let range = selection.getRanges()[0];
            //this.cursorPosition = range.startOffset + 1;
            if(bt){
                //this.cursorPosition = range.startOffset + bt.length;
                this.cursorPosition += bt.length;
            } else {
                this.cursorPosition += 1;
                //this.cursorPosition = range.startOffset + 1;
            }

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
