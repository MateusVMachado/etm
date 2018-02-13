import { IOpenFacEngine } from "./OpenFac.Engine.Interface";

export interface IOpenFacAction {
    Execute(Engine: IOpenFacEngine): void;
}