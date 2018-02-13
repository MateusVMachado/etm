import { IOpenCapKeyboard } from "./OpenFac.Keyboard.Interface";
import { OpenCapKeyboardButton } from "./OpenFac.Button";
import { OpenCapKeyboardLine } from "./OpenFac.KeyboardLine";

export class OpenCapKeyboard implements IOpenCapKeyboard {
    
    public Lines: OpenCapKeyboardLine = new OpenCapKeyboardLine();
    
    public DoAction(button: OpenCapKeyboardButton): void {
        
    }

}