import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';
import { KeyboardWriterService } from './OpenFAc.KeyboardWriterService';

export class OpenFacActionTTS implements IOpenFacAction {
    private editor: any;
    public keyCommandService: any;
    public zone: any;
    public selection: any;
    public range: any;

    constructor(private args: any){
        this.editor = this.args[0];
        this.keyCommandService = this.args[1];
        this.zone = this.args[2];

    }
    

    public Execute(Engine: IOpenFacEngine): void {
        
        let eg = <OpenFacEngine>Engine;
        let bt = eg.GetCurrentButton();

        if(bt.Text === '*mic'){
            console.log('DEBUG: chamando speak');
            this.speak(this.selectAll(), this.callback.bind(this));
        } else {
            let str = bt.Text;
            console.log('DEBUG: chamando speak');
            this.speak(str, this.callback.bind(this));
        }
        

        // this.speak("pt", null, [ /Google português do Brasil/, /Samantha/, /Fiona/, /Victoria/, /male/i ], "Olá, mundo.")
        // .then(() => this.speak("pt", null, [ /\Wmale/i ], "Olá, mundo."))
        // .then(() => this.speak("pt", "BR", [ /male/i ], "Olá, mundo."))
        // .then(() => this.speak("pt", "BR", null, "Olá, mundo."))
        // .then(() => this.speak("pt", "BR", [ /\Wmale/i ], "Olá, mundo."));
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


    public selectAll(){
        let data = this.editor.getData();

        data = data.replace(/(<([^>]+)>)/ig,"");
        data = data.replace(/(&([^>]+);)/ig," ");
    
        return data;
    }



    public Free(): void {
        if (this) {
            this.Dispose();
        }
    }

    
    public OpenFacActionTTS(){

    }
    public Dispose(): void {

    }


}