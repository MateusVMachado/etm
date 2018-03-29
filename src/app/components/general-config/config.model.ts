import { OpenFACConfig } from "openfac/OpenFac.ConfigContract";

export class ConfigModel {
    openFacConfig: OpenFACConfig;
    user: string;
    lastKeyboard: string;
    
    constructor() {
       this.openFacConfig = new OpenFACConfig();
    }
}