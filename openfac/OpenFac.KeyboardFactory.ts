import { IOpenFacKeyboard } from './OpenFac.Keyboard.Interface';

export class OpenFacKeyboardFactory {

    public static dicTypes: Map<string, any> = new Map<string, any>();
    
    public static Create<T extends IOpenFacKeyboard>(keyboardName: string): IOpenFacKeyboard {
        //primeiro faz o get no dic 
        let result = this.dicTypes.get(keyboardName);
        if( result ) {
            return new result();
        } else {
            throw new console.error("No type registered for this id");
        }    
    }

    public static Register<T extends IOpenFacKeyboard>(keyboardName: string, type: { new(args?:any): T ;}): void {
        OpenFacKeyboardFactory.dicTypes.set(keyboardName, type);
    }

   
}