import { IOpenFacAction } from "./OpenFac.Action.Interface";

export class OpenFacKeyboardButton {
    public Items: Array<OpenFacKeyboardButton> = new Array<OpenFacKeyboardButton>();
    public Action: IOpenFacAction;
    public Caption: String;
    public Text: String;
    
    public Add(): OpenFacKeyboardButton {
        let bt  = new OpenFacKeyboardButton();
        this.Items.push(bt);
        return bt;
    }

    public Count(): number {
        return this.Items.length;
    }

}