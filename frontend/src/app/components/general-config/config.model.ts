import { OpenFACConfig } from "openfac/OpenFac.ConfigContract";

export class ConfigModel {
    openFacConfig: OpenFACConfig;
    user: string;
    lastKeyboard: string;
    level: number;
    flexSup: string;
    flexUnd: string;
    ActiveSensor: string;
    
    constructor() {
       this.openFacConfig = new OpenFACConfig();
    }
}