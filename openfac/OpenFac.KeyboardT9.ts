import { OpenFacKeyboard } from './OpenFac.Keyboard';
import { IOpenFacPredictor } from './OpenFac.PredictorInterface';
import { OpenFacKeyboardButton } from './OpenFac.KeyboardButton';
import { IOpenFacKeyboard } from './OpenFac.Keyboard.Interface';

export class OpenFacKeyboardT9 extends OpenFacKeyboard {

    private predictor: IOpenFacPredictor;
    
    constructor() {
        super();
    }
    
    public Dispose (): void {

    }
    public  DoAction (button: OpenFacKeyboardButton): void {

    }
    public static Create (): IOpenFacKeyboard {
        return new OpenFacKeyboardT9 ();
    } 
}