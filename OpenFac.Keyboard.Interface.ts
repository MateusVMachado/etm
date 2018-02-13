import { OpenFacKeyboardButton } from "./OpenFac.Button";

export interface IOpenFacKeyboard {
    DoAction(button: OpenFacKeyboardButton): void;
}