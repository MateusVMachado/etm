import { OpenFACConfig } from './OpenFacConfig.model';

export class ConfigurationModel {
    user: string;
    language: string;
    openFacConfig: OpenFACConfig;
    lastKeyboard: string;
    level: number;
    flexSup: string;
    flexUnd: string;

    constructor(){
        this.openFacConfig = new OpenFACConfig();
    }
}