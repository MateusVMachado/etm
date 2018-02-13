import { OpenCapKeyboardButton } from "./OpenFac.Button";

export class OpenCapKeyboardLine {
    
    public Items: Array<OpenCapKeyboardLine> = new Array<OpenCapKeyboardLine>();
    public Buttons: OpenCapKeyboardButton = new OpenCapKeyboardButton();

    public Add(): OpenCapKeyboardLine {
        let li = new OpenCapKeyboardLine();
        this.Items.push(li);
        return li;
    };

    public Count(): number {
        return this.Items.length;
    };

};