import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';
import { KeyboardWriterService } from 'openfac/OpenFAc.KeyboardWriterService';

export class OpenFacActionKeyboardAndTTS implements IOpenFacAction {
    private editor: any;
    public keyCommandService: any;
    public zone: any;
    public selection: any;
    public range: any;

    public cursorPosition: number;
    private maxLength: number;

    constructor(private args: any){
        this.editor = this.args[0];
        this.keyCommandService = this.args[1];
        this.zone = this.args[2];
        this.cursorPosition = this.args[3];
        this.maxLength = this.args[4];
    }


    public Dispose(): void {

    }



    public Execute(Engine: IOpenFacEngine): void {

        
        let eg = <OpenFacEngine>Engine;
        let bt = eg.GetCurrentButton();

        let str = bt.Text;
        this.speak(str, this.callback.bind(this));
    
        this.editor.focus();
        this.editor.insertText(bt.Text);
        this.maxLength += bt.Text.length;
        this.doGetCaretPosition(false, bt.Text);
        

        // this.speak("pt", null, [ /Google português do Brasil/, /Samantha/, /Fiona/, /Victoria/, /male/i ], "Olá, mundo.")
        // .then(() => this.speak("pt", null, [ /\Wmale/i ], "Olá, mundo."))
        // .then(() => this.speak("pt", "BR", [ /male/i ], "Olá, mundo."))
        // .then(() => this.speak("pt", "BR", null, "Olá, mundo."))
        // .then(() => this.speak("pt", "BR", [ /\Wmale/i ], "Olá, mundo."));
    }

    public doGetCaretPosition(toReturn?:boolean, bt?:string) {
        this.editor.focus();
        let selection = this.editor.getSelection();
        if(selection !== null) { 
            let range = selection.getRanges()[0];
            //this.cursorPosition = range.startOffset + 1;
            //if(bt){
                //this.cursorPosition = range.startOffset + bt.length;    
            //    this.cursorPosition += bt.length;    
            //} else {
                this.cursorPosition = range.startOffset + 1;
            //    this.cursorPosition += 1;
           // }
            
        }    


        if(toReturn) return this.cursorPosition;
    }

    private speak(text, callback) {
        let u = new SpeechSynthesisUtterance();
        
        let voices = speechSynthesis.getVoices();
 
        let derangedVoice = voices.filter(function (voice) {
            return voice.name == 'Google português do Brasil';
        })[0];
        
        // create the uttrance
        
        u.voice = derangedVoice;
        //u.text = 'Jon likes Iced Tea!';
  

        u.text = text;
        u.lang = 'pt-br';

        u.volume = 50;

        u.onend = function () {
            if (callback) {
                callback();
            }
        };
     
        u.onerror = function (e) {
            if (callback) {
                callback(e);
            }
        };
     
        speechSynthesis.speak(u);
    }

    private callback(){
      //DO SOMETHING
    }


    public Free(): void {
        if (this) {
            this.Dispose();
        }
    }


}