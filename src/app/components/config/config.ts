import { OpenFACConfig } from "openfac/OpenFac.ConfigContract";

export class ConfigModel {
    language: string;
    openFacConfig: OpenFACConfig;
    user: string;
    lastKeyboard: string;
    
    constructor() {
       this.openFacConfig = new OpenFACConfig();
    }
}