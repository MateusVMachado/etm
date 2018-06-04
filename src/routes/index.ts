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
import { TecladoCompartihadoNota } from "../apis/tec_compart_nota";
import { TecladoCompartihado } from "../apis/tec_compart";

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
    let tec_compart_nota = new TecladoCompartihadoNota();
    let tec_compart = new TecladoCompartihado();
    
    console.log("[Server is UP and listening]\n");
    
    // HOME
    //add home page route
    router.get("/", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      newIndexRoute.index(req, res, next);
    });
    
    // TECLADOS
    // Rota para API de teclados  
    router.get("/keyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.keyboard_api(req,res,next);  
    });
    
    router.get("/keyboardByUser", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.getKeyboardByUser(req,res,next);  
    });
    
    router.get("/getSingleKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.getSingleKeyboardByName(req,res,next);  
    });
    router.get("/getSingleKeyboardByEmail", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.getSingleKeyboardByEmail(req,res,next);  
    });
    
    router.get("/keyboard/getKeyboardNames", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.getKeyboardNames(req,res,next);  
    });
    router.get("/getMultipleKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.getMultipleKeyboard(req,res,next);  
    });
    router.post("/keyboard/insertNewKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      // console.log('entrou no post')
      keyboard.insertNewKeyboard(req,res,next);  
    });
    
    router.post("/keyboard/insertUpdateKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.insertUpdateKeyboard(req,res,next);  
    });
    
    router.post("/keyboard/insertUpdateOnlyKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.insertUpdateOnlyKeyboard(req,res,next);  
    });
    
    router.post("/keyboard/insertBasicAtRegister", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.insertBasicAtRegister(req,res,next);  
    });
    
    router.post("/keyboard/insertBasicIntoDatabase", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.insertBasicIntoDatabase(req,res,next);  
    });
    
    router.post("/keyboard/deleteKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      keyboard.deleteKeyboard(req,res,next);  
    });
    
    
    
    // LOGIN
    // Rota para handler do login
    router.post("/login", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      logger.logSessionStart(req,res,next,'true');   
      login.authenticateUser(req, res, next);
    });
    
    
    router.post("/emailRequestPassword", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      login.emailRequestPassword(req,res,next);
    });
    router.get("/isAccountBlocked", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      login.isAccountBlocked(req,res,next);
    });
    router.get("/blockAccount", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      login.blockAccount(req,res,next);
    });
    
    router.post("/loginLoggerGps", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      logger.logSessionStart(req,res,next,'false');   
    });
    
    
    router.post("/logout", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
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
      register.registerUser(req, res, next);
    });
    
    // Rota para salvar configurações
    router.post("/configuration", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      configuration.userConfigure(req, res, next);
    });
    
    // Rota para salvar configurações
    router.post("/configurationUpdate", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      // console.log("UPDATE DE CONFIGURAÇÃO")
      configuration.userConfigureUpdate(req, res, next);
    });
    
    
    // Rota para buscar configurações
    router.get("/configuration", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      configuration.getUserConfigure(req, res, next);
    });
    
    // Rota para atualizar informações do usuário
    router.post("/updateUser", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      user.updateUser(req, res, next);
    });
    router.post("/updateUserPassword", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      user.updateUserPassword(req, res, next);
    });
    
    // Rota para buscar foto de perfil do usuário
    router.get("/getUserProfilePicture", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      profilePic.getUserProfilePicture(req, res, next);
    });
    
    // Rota para buscar informações do usuário
    router.get("/user", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      user.getUser(req, res, next);
    });
    
    //TECLADO COMPARTILHADO
    router.get("/tec_compart", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      tec_compart.getTecladosCompartilhados(req,res,next);  
    });
    router.get("/tec_compart/setTecladoVisualizado", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      tec_compart.setTecladoVisualizado(req,res,next);  
    });
    router.get("/tec_compart/setTecladoUsado", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      tec_compart.setTecladoUsado(req,res,next);  
    });
    router.post("/tec_compart/shareKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      tec_compart.setTecladoCompartilhado(req,res,next);  
    });
    router.get("/tec_compart/removeKeyboard", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      tec_compart.removeKeyboard(req,res,next);  
    });
    //TECLADO COMPARTILHADO - NOTA
    router.get("/tec_compart_nota", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      tec_compart_nota.getNotaMedia(req,res,next);  
    });
    router.get("/tec_compart_nota/avaliar", (req: Request, res: Response, next: NextFunction) => {
      res.locals.mongoAccess = app.locals.mongoAccess;
      tec_compart_nota.getJaAvaliou(req,res,next);  
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