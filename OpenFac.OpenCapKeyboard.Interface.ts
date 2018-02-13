import { OpenCapKeyboardButton } from "./OpenFac.OpenCapButton";

export interface IOpenCapKeyboard {
    DoAction(button: OpenCapKeyboardButton): void;
}