import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';

export class OpenFacActionTTS implements IOpenFacAction {

    public OpenFacActionTTS(){

    }
    public Dispose(): void {

    }

    public Speak(text: string): void {
        // IMPLEMENTAR
        //SpeechSynthesizer reader = new SpeechSynthesizer();
        //reader.SpeakAsync(text);
    }

    public Execute(Engine: IOpenFacEngine): void {
        let eg = <OpenFacEngine>Engine;
        let bt = eg.GetCurrentButton();
        let str = bt.Text;
        this.Speak(str);
    }

    public Free(): void {
        if (this) {
            this.Dispose();
        }
    }

    public static Create(): IOpenFacAction {
        return new OpenFacActionTTS();
    }

}