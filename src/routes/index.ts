import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import * as express from 'express';
import { Keyboard } from '../apis/keyboard/keyboard.api';
import { MongoAccessModel } from "../models/mongoAccess.model";
import * as moment from 'moment';
import { Logger } from "../apis/logger.api";
import { Login } from '../apis/login/login.api';
import { Auth } from '../apis/auth.api';
import { Register } from '../apis/register.api';
import { MongoConfig } from '../mongo.config';
import { Configuration } from "../apis/configuration.api";
import { ConfigurationModel } from "../models/configuration.model";
import { User } from "../apis/user.api";
import { ProfilePicture } from "../apis/profile-picture.api";

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
    let newIndexRoute = new IndexRoute();    let logger = new Logger();
    let keyboard = new Keyboard();    let login = new Login();
    let auth = new Auth();    let register = new Register();
    let mongoC = new MongoConfig();    let configuration = new Configuration();
    let user = new User();  let profilePic = new ProfilePicture();

    console.log("[Server is UP and listening]\n");

    // HOME
    //add home page route
    router.get("/", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      newIndexRoute.index(req, res, next);
    });
    
    // TECLADOS
    // Rota para API de teclados  
    router.get("/keyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //console.log("LOGGER NO GET");
      //logger.logRequests(req);
      keyboard.keyboard_api(req,res,next);  
    });

    router.get("/keyboardByUser", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      keyboard.getKeyboardByUser(req,res,next);  
    });

    router.get("/getSingleKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //console.log("LOGGER NO GET");
      //logger.logRequests(req);
      keyboard.getSingleKeyboardByName(req,res,next);  
    });

    router.get("/keyboard/getKeyboardNames", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //console.log("getKeyboardNames");
      //logger.logRequests(req);
      keyboard.getKeyboardNames(req,res,next);  
    });

    router.post("/keyboard/insertNewKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      keyboard.insertNewKeyboard(req,res,next);  
    });

    router.post("/keyboard/insertUpdateKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      keyboard.insertUpdateKeyboard(req,res,next);  
    });

    router.post("/keyboard/insertUpdateOnlyKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      keyboard.insertUpdateOnlyKeyboard(req,res,next);  
    });

    router.post("/keyboard/insertBasicAtRegister", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      keyboard.insertBasicAtRegister(req,res,next);  
    });

    router.post("/keyboard/insertBasicIntoDatabase", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      keyboard.insertBasicIntoDatabase(req,res,next);  
    });

    router.post("/keyboard/deleteKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      keyboard.deleteKeyboard(req,res,next);  
    });

    // LOGIN
    // Rota para handler do login
    router.post("/login", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      console.clear();
      console.log("LOGGER NO POST");
      logger.logSessionStart(req,res,next);
      //logger.logRequests(req);
      login.authenticateUser(req, res, next);
    });


    router.all("/logout", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      console.log("received in /logout");
      
      logger.logSessionEnd(req,res,next);
      
    });

    router.post("/setLayoutEditorIntervals", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
   
      logger.logLayoutIntervals(req,res,next);
    });

    router.post("/setKeyboardIntervals", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
   
      logger.logKeyboardIntervals(req,res,next);
    });

    router.post("/setConfigIntervals", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
   
      logger.logConfigIntervals(req,res,next);
    });


    
    // REGISTER
    // Rota para handler do registro
    router.post("/register", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //console.log("LOGGER NO POST");
      //logger.logRequests(req);
      register.registerUser(req, res, next);
    });

    // Rota para alguma área que precisa de privilégios
    router.all("/secret", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      //auth.authorizeUser(req, res, next);
      mongoC.configureDatabase(req, res, next);
    });

    // Rota para salvar configurações
    router.post("/configuration", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      configuration.userConfigure(req, res, next);
    });

    // Rota para buscar configurações
    router.get("/configuration", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      configuration.getUserConfigure(req, res, next);
    });

    // Rota para atualizar informações do usuário
    router.post("/updateUser", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      user.updateUser(req, res, next);
    });

    // Rota para buscar foto de perfil do usuário
    router.get("/getUserProfilePicture", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      profilePic.getUserProfilePicture(req, res, next);
    });

    // Rota para buscar informações do usuário
    router.get("/user", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      //logger.logRequests(req);
      user.getUser(req, res, next);
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