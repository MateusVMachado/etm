import { OpenFACConfig } from '../models/OpenFacConfig.model';
import { ConfigurationModel } from '../models/configuration.model';
import { BaseRoute } from '../routes/route';
import { NextFunction, Request, Response } from "express";

export class Configuration extends BaseRoute {
    
    constructor(){
        super();
    }

    public userConfigure(req: Request, res: Response, next: NextFunction){
        let config = req.body as ConfigurationModel;

        res.locals.mongoAccess.coll[2].find({ "user": config.user }).toArray(function(err, config_list) {
            if(config_list.length == 0){
                res.locals.mongoAccess.coll[2].insert(config, (err, result) => {
                    console.log("configuração inserida");
                    res.status(200);
                });
            } else {
                res.locals.mongoAccess.coll[2].update({ "user": config.user }, { "openFacConfig": config.openFacConfig, "language": config.language, "user": config.user });
                res.status(200);
            }
        });
    }

    public getUserConfigure(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[2].find({ "user": req.query.email }).toArray(function(err, config_list) {                    
            let config: ConfigurationModel = new ConfigurationModel() ;
            if(config_list.length == 0){
                config.openFacConfig.ActiveSensor = "joy";
                config.openFacConfig.ScanType = "automatico";
                config.openFacConfig.ScanTime = 3;
                config.language = "pt-br"

                res.status(200).send(config);
            } else {
                let configuration = config_list[0];
                config.openFacConfig = configuration.openFacConfig;
                config.language = configuration.language

                res.status(200).send(config);
            }
        });
    }
}