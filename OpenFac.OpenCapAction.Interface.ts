import { IOpenCapEngine } from "./OpenFac.OpenCapEngine.Interface";

export interface IOpenCapAction {
    Execute(Engine: IOpenCapEngine): void;
}