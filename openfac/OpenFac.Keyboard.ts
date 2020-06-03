import { IOpenFacKeyboard } from "./OpenFac.Keyboard.Interface";
import { OpenFacKeyboardButton } from "./OpenFac.KeyboardButton";
import { OpenFacKeyboardLine } from "./OpenFac.KeyboardLine";

export class OpenFacKeyboard implements IOpenFacKeyboard {
    
    public Lines: OpenFacKeyboardLine = new OpenFacKeyboardLine();
    public OpenFacKeyboard()
    {

    }
    public DoAction(button: OpenFacKeyboardButton): void {
        
    }

}