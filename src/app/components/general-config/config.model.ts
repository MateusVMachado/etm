import { OpenFACConfig } from "openfac/OpenFac.ConfigContract";

export class ConfigModel {
    language: string;
    openFacConfig: OpenFACConfig;
    user: string;
    lastKeyboard: string;
    level: number;
    
    constructor() {
       this.openFacConfig = new OpenFACConfig();
    }
}