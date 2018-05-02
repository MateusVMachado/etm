import { OpenFACConfig } from '../models/OpenFacConfig.model';
import { ConfigurationModel } from '../models/configuration.model';
import { BaseRoute } from '../routes/route';
import { NextFunction, Request, Response } from "express";

export class Configuration extends BaseRoute {
    
    constructor(){
        super();
    }

    public userConfigure(req: Request, res: Response, next: NextFunction){
        if ( req.query.onlyKeyboard ){
            res.locals.mongoAccess.coll[2].update({ "user": req.query.email }, { $set: {"lastKeyboard": req.query.onlyKeyboard }});
            res.status(200).send();
        } else {
        let config = req.body as ConfigurationModel;

            console.log(config.level);

        res.locals.mongoAccess.coll[2].find({ "user": config.user }).toArray(function(err, config_list) {
                if(config_list.length === 0){
                res.locals.mongoAccess.coll[2].insert(config, (err, result) => {
                    console.log("configuração inserida");
                        res.status(200).send();
                });
            } else {
                    console.log("Fazendo update");
                    console.log(config.level + ' ' + config.user );
                    res.locals.mongoAccess.coll[2].update({ "user": config.user }, { "openFacConfig": config.openFacConfig, "language": config.language, "user": config.user,
                         "lastKeyboard": config.lastKeyboard, "level": config.level });
                    res.status(200).send();
            }
        });
        }    
    }

    public userConfigureUpdate(req: Request, res: Response, next: NextFunction){
        //let config = req.body as ConfigurationModel;
        let parts = req.body;
        console.log("PARTS: " + parts);

        res.locals.mongoAccess.coll[2].find({ "user": parts[2] }).toArray(function(err, config_list) {
                    console.log("Fazendo update");
                    console.log(parts[0] + ' ' + parts[1] );
                    res.locals.mongoAccess.coll[2].update({ "user": parts[2] }, { $set: {"flexSup": parts[0] , "flexUnd": parts[1]} });
                    res.status(200).send();
            
        });
           
    }


    public getUserConfigure(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[2].find({ "user": req.query.email }).toArray(function(err, config_list) {                    
            let config: ConfigurationModel = new ConfigurationModel() ;
            if(config_list.length == 0){
                config.openFacConfig.ActiveSensor = "joy";
                config.openFacConfig.ScanType = "automatico";
                config.openFacConfig.ScanTimeLines = 1.5;
                config.openFacConfig.ScanTimeColumns = 1.5;
                config.language = "pt-br";
                config.openFacConfig.KeyboardLayout = "QWERTY";
                config.lastKeyboard = "pt-br"
                config.level = 0.30;
                config.flexSup = '';
                config.flexUnd = '';

                res.status(200).send(config);
            } else {
                let configuration = config_list[0];
                console.log(JSON.stringify(configuration));
                config.openFacConfig = configuration.openFacConfig;
                config.language = configuration.language;
                config.lastKeyboard = configuration.lastKeyboard;
                config.level = configuration.level;
                config.flexSup = configuration.flexSup;
                config.flexUnd = configuration.flexUnd;

                res.status(200).send(config);
            }
        });
    }
}