import { IOpenFacKeyboard } from './OpenFac.Keyboard.Interface';

export class OpenFacKeyboardFactory {

    public static dicTypes: Map<string, any> = new Map<string, any>();
    
    public static Create<T extends IOpenFacKeyboard>(keyboardName: string, type: { new(): T ;}): IOpenFacKeyboard {
        //primeiro faz o get no dic 
        //let abc = typeof(type);
        if(this.dicTypes.get(keyboardName) ){
            return new type();
        } else {
            throw new console.error("No type registered for this id");
        }    
    }

    public static Register<T extends IOpenFacKeyboard>(actionName: string, type: { new(): T ;}): void {
        OpenFacKeyboardFactory.dicTypes.set(actionName, type);
    }

   
}