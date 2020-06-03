import { IOpenFacAction } from './OpenFac.Action.Interface';

export class OpenFacKeyboardButton {
    public Items: Array<OpenFacKeyboardButton> = new Array<OpenFacKeyboardButton>();
    public Caption: string;
    public Text: string;
    public Action: IOpenFacAction;

    constructor() {

    }

    public Add(): OpenFacKeyboardButton {
        var bt: OpenFacKeyboardButton = new OpenFacKeyboardButton();
        this.Items.push(bt);
        return bt;
    }
    public Count(): number {
        return this.Items.length;
    }

}