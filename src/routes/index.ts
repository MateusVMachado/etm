import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import * as express from 'express';
import { Keyboard } from '../apis/keyboard.api';
import { MongoAccessModel } from "../models/mongoAccess.model";
import * as moment from 'moment';
import { BackLogger } from "../apis/backLogger.api";
import { Login } from '../apis/login.api';
import { Auth } from '../apis/auth.api';

/**
 * / route
 *
 * @class User
 */
export class IndexRoute extends BaseRoute {

  /**
   * Create the routes.
   * 
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create(router: Router, app: express.Application) {  
    var newIndexRoute = new IndexRoute();
    var backLogger = new BackLogger();
    var keyboard = new Keyboard();
    var login = new Login();
    var auth = new Auth();
    
    console.log("[Server is UP and listening]\n");

    //add home page route
    router.get("/", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      backLogger.logRequests(req);
      newIndexRoute.index(req, res, next);
    });

    router.post("/login", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      console.log("LOGGER NO POST");
      backLogger.logRequests(req);
      login.authenticateUser(req, res, next);
    });

    router.all("/secret", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      backLogger.logRequests(req);
      auth.authorizeUser(req, res, next);
    });
    
  
    // Rota para API de teclados  
    router.get("/keyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      console.log("LOGGER NO GET");
      backLogger.logRequests(req);
      keyboard.keyboard_api(req,res,next);  
    });

  }



  //GETTING IP ADDRESS FROM REMOTE HOST

  //var ip = req.headers['x-forwarded-for'] || 
 // req.connection.remoteAddress || 
 // req.socket.remoteAddress ||
 // req.connection.socket.remoteAddress;
//console.log(ip);

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * The home page route.
   *
   * @class IndexRoute
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @next {NextFunction} Execute the next method.
   */
  public index(req: Request, res: Response, next: NextFunction) {
    //set custom title
    this.title = "Home | ETM - BackEnd";

    //set message
    let options: Object = {
      "message": "Data service active.",
      "payload": ""
    };
    //res.send("TRUE");
    //render template
    this.render(req, res, "index", options);
  }

}





/*
    router.get("/keyboard", (req: Request, res: Response, next: NextFunction) => {
      
      //////////////////////////////////////////////////////////////////
     // O CODIGO ABAIXO É PARA PODER ESCOLHER ENTRE DIVERSAS OPÇÕES  //
    //////////////////////////////////////////////////////////////////
      //console.log(req.query);
      //if(req.query.id === '1'){
      //  console.log("EXECUTA AQUI SUA OPÇÃO");
      //}
    ///////////////////////////////////////////////////////////////
      res.locals.mongoAccess = mongoAccess;
      //new IndexRoute().keyboard.keyboard_api(req, res, next, mongoAccess);
      new IndexRoute().keyboard.keyboard_api(req, res, next);
      
  });
*/