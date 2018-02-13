import { IOpenCapEngine } from "./OpenFac.Engine.Interface";

export interface IOpenCapAction {
    Execute(Engine: IOpenCapEngine): void;
}