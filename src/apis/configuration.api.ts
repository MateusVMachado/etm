import { ConfigurationModel } from "../models/configuration.model";
import { BaseRoute } from "../routes/route";
import { NextFunction, Request, Response } from "express";

export class Configuration extends BaseRoute {
  constructor() {
    super();
  }

  public userConfigure(req: Request, res: Response, next: NextFunction) {
    if (req.query.onlyKeyboard) {
      this.getMongoAccess(res)
        .configurations()
        .subscribe(configCollection => {
          configCollection.update(
            { user: req.query.email },
            { $set: { lastKeyboard: req.query.onlyKeyboard } },
            function() {
              res.status(200).send();
            }
          );
        });
    } else {
      let config = req.body as ConfigurationModel;

      this.getMongoAccess(res)
        .configurations()
        .subscribe(configCollection => {
          configCollection
            .find({ user: config.user })
            .toArray(function(err, config_list) {
              if (config_list.length === 0) {
                configCollection.insert(config, (err, result) => {
                  res.status(200).send();
                });
              } else {
                configCollection.update(
                  { user: config.user },
                  {
                    openFacConfig: config.openFacConfig,
                    language: config.language,
                    user: config.user,
                    lastKeyboard: config.lastKeyboard,
                    level: config.level
                  },
                  function() {
                    res.status(200).send();
                  }
                );
              }
            });
        });
    }
  }

  public defaultConfig(res: Response, userEmail: string, callBack: Function) {

    let config = new ConfigurationModel();
    config.openFacConfig.ActiveSensor = "joy";
    config.openFacConfig.ScanTimeLines = 1;
    config.openFacConfig.ScanTimeColumns = 1;
    config.user = userEmail;
    config.lastKeyboard = "pt-br";
    config.level = 0;

    this.getMongoAccess(res)
      .configurations()
      .subscribe(configCollection => {
        configCollection
          .find({ user: config.user })
          .toArray(function(err, config_list) {
            if (config_list.length === 0) {
              configCollection.insert(config, (err, result) => {
                callBack();
              });
            } else {
              configCollection.update(
                { user: config.user },
                {
                  openFacConfig: config.openFacConfig,
                  user: config.user,
                  lastKeyboard: config.lastKeyboard,
                  level: config.level
                },
                function() {
                  callBack();
                }
              );
            }
          });
      });

  }


  public userConfigureUpdate(req: Request, res: Response, next: NextFunction) {
    let parts = req.body;

    this.getMongoAccess(res)
      .configurations()
      .subscribe(configCollection => {
        configCollection
          .find({ user: parts[2] })
          .toArray(function(err, config_list) {
            configCollection.update(
              { user: parts[2] },
              { $set: { flexSup: parts[0], flexUnd: parts[1] } },
              function() {
                res.status(200).send();
              }
            );
          });
      });
  }

  public getUserConfigure(req: Request, res: Response, next: NextFunction) {
    this.getMongoAccess(res)
      .configurations()
      .subscribe(configCollection => {
        configCollection
          .find({ user: req.query.email })
          .toArray(function(err, config_list) {
            let config: ConfigurationModel = new ConfigurationModel();
            if (config_list.length == 0) {
              config.openFacConfig.ActiveSensor = "joy";
              config.openFacConfig.ScanType = "automatico";
              config.openFacConfig.ScanTimeLines = 1.5;
              config.openFacConfig.ScanTimeColumns = 1.5;
              config.language = "pt-br";
              config.openFacConfig.KeyboardLayout = "QWERTY";
              config.lastKeyboard = "pt-br";
              config.level = 0.3;
              config.flexSup = "";
              config.flexUnd = "";

              res.status(200).send(config);
            } else {
              let configuration = config_list[0];
              config.openFacConfig = configuration.openFacConfig;
              config.language = configuration.language;
              config.lastKeyboard = configuration.lastKeyboard;
              config.level = configuration.level;
              config.flexSup = configuration.flexSup;
              config.flexUnd = configuration.flexUnd;

              res.status(200).send(config);
            }
          });
      });
  }
}
