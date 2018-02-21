import { OpenFACConfig } from '../models/OpenFacConfig.model';
import { ConfigurationModel } from '../models/configuration.model';
import { BaseRoute } from '../routes/route';
import { NextFunction, Request, Response } from "express";

export class Configuration extends BaseRoute {
    
    constructor(){
        super();
    }

    public userConfigure(req: Request, res: Response, next: NextFunction){
        let config = new ConfigurationModel();
        config.openFacConfig = new OpenFACConfig();

        config.language = req.body['language'];
        config.openFacConfig = req.body['openFacConfig'];

        res.locals.mongoAccess.coll[2].insert(config.openFacConfig, (err, result) => {
            console.log("configuração inserida");
        }); 
        console.log("fim requisiçao");
        res.status(200);
    }
}