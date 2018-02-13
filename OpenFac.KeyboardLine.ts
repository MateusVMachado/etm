import { OpenFacKeyboardButton } from "./OpenFac.Button";

export class OpenFacKeyboardLine {
    
    public Items: Array<OpenFacKeyboardLine> = new Array<OpenFacKeyboardLine>();
    public Buttons: OpenFacKeyboardButton = new OpenFacKeyboardButton();

    public Add(): OpenFacKeyboardLine {
        let li = new OpenFacKeyboardLine();
        this.Items.push(li);
        return li;
    };

    public Count(): number {
        return this.Items.length;
    };

};