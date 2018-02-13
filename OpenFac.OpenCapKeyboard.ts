import { IOpenCapKeyboard } from "./OpenFac.OpenCapKeyboard.Interface";
import { OpenCapKeyboardButton } from "./OpenFac.OpenCapButton";
import { OpenCapKeyboardLine } from "./OpenFac.OpenCapKeyboardLine";

export class OpenCapKeyboard implements IOpenCapKeyboard {
    
    public Lines: OpenCapKeyboardLine = new OpenCapKeyboardLine();
    
    public DoAction(button: OpenCapKeyboardButton): void {
        
    }

}