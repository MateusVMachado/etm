import { OpenFacKeyboardButton } from "./OpenFac.KeyboardButton";

export interface IOpenFacKeyboard {
    DoAction(button: OpenFacKeyboardButton): void;
}