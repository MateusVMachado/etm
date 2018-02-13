import { IOpenCapAction } from "./OpenFac.OpenCapAction.Interface";

export class OpenCapKeyboardButton {
    public Items: Array<OpenCapKeyboardButton> = new Array<OpenCapKeyboardButton>();
    public Action: IOpenCapAction;
    public Caption: String;
    public Text: String;
    
    public Add(): OpenCapKeyboardButton {
        let bt  = new OpenCapKeyboardButton();
        this.Items.push(bt);
        return bt;
    }

    public Count(): number {
        return this.Items.length;
    }

}