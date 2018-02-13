import { IOpenFacKeyboard } from './OpenFac.Keyboard.Interface';

export class OpenFacKeyboardManager {
    private keyboardList: Map<string, IOpenFacKeyboard> = new Map<string, IOpenFacKeyboard>();
    public Add(keyboardName: string, IKeyboard: IOpenFacKeyboard): void {
        this.keyboardList.set(keyboardName, IKeyboard);
    }
    public List(): Map<string, IOpenFacKeyboard> {
        return this.keyboardList;
    }
    public Find(keyboardName: string): IOpenFacKeyboard {
        let keyboard: IOpenFacKeyboard;
        keyboard = this.keyboardList.get(keyboardName);
        if(!keyboard){
            //keyboard = OpenFacKeyboardFactory<IOpenFacKeyboard>.Create(keyboardName);
            if(keyboard){
                this.Add(keyboardName, keyboard);
            }
        } 
        return keyboard;
    }
}