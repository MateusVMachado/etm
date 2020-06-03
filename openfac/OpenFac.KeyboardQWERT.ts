import { OpenFacKeyboardButton } from './OpenFac.KeyboardButton';
import { IOpenFacKeyboard } from './OpenFac.Keyboard.Interface';
import { IOpenFacPredictor } from './OpenFac.PredictorInterface';
import { OpenFacKeyboard  } from './OpenFac.Keyboard';

export class OpenFacKeyboardQWERT extends OpenFacKeyboard {
    private predictor: IOpenFacPredictor;
    
    constructor() {
        super();
    }

    public DoAction(button: OpenFacKeyboardButton): void {

    }

    public static Create(): IOpenFacKeyboard {
        return new OpenFacKeyboardQWERT();
    }
}