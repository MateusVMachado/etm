import { OpenFacKeyboardButton } from "./OpenFac.KeyboardButton";

export class OpenFacKeyboardLine {
    
    public Items: Array<OpenFacKeyboardLine> = new Array<OpenFacKeyboardLine>();
    public Buttons: OpenFacKeyboardButton = new OpenFacKeyboardButton();

    constructor() {

    }

    public Add(): OpenFacKeyboardLine {
        let li = new OpenFacKeyboardLine();
        this.Items.push(li);
        return li;
    };

    public Count(): number {
        return this.Items.length;
    };

};