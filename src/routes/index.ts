import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";

import { Keyboard } from '../apis/keyboard.api';
import { MongoAccessModel } from "../apis/mongoAcces.model";

/**
 * / route
 *
 * @class User
 */
export class IndexRoute extends BaseRoute {

    public keyboard: Keyboard = new Keyboard();
    //public indexRoute: IndexRoute = new IndexRoute();
  /**
   * Create the routes.
   * 
   *
   * @class IndexRoute
   * @method create
   * @static
   */
  public static create(router: Router, mongoAccess: MongoAccessModel) {
    //log
    console.log("[IndexRoute::create] Creating index route.");

    //add home page route
    router.get("/", (req: Request, res: Response, next: NextFunction) => {
      new IndexRoute().index(req, res, next);
    });

    router.get("/keyboard", (req: Request, res: Response, next: NextFunction) => {
      
        //////////////////////////////////////////////////////////////////
       // O CODIGO ABAIXO É PARA PODER ESCOLHER ENTRE DIVERSAS OPÇÕES  //
      //////////////////////////////////////////////////////////////////
        //console.log(req.query);
        //if(req.query.id === '1'){
        //  console.log("EXECUTA AQUI SUA OPÇÃO");
        //}
      ///////////////////////////////////////////////////////////////

        new IndexRoute().keyboard.keyboard_api(req, res, next, mongoAccess);
        
    });

  }

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

    //render template
    this.render(req, res, "index", options);
  }

}