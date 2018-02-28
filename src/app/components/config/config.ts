import { OpenFACConfig } from "openfac/OpenFac.ConfigContract";

export class ConfigModel {
    language: string;
    openFacConfig: OpenFACConfig;
    user: string;
    constructor() {
       this.openFacConfig = new OpenFACConfig();
    }
}