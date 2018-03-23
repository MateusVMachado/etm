import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan"; // Para modo desenvolvimento apenas
import * as path from "path";
import * as errorHandler from "errorhandler"; // Para modo desenvolvimento apenas
import * as helmet from 'helmet';
import * as jwt from 'express-jwt';

import { IndexRoute } from "./routes/index";
import { MongoAccessModel } from "./models/mongoAccess.model";
import * as promise from 'promise';
import { promisify } from "util";
import { Login } from './apis/login/login.api';
import { backendConfig } from  './backend.config';

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

  public mongoAccess: MongoAccessModel = new MongoAccessModel();
  public poolSize: number = 100;
  public guard: Login = new Login();

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();

    //promisify.

    //configure application
    this.config();

    //add routes
    this.routes();

    //add api
    this.api();

    // Cria pool de conexões e configura acesso
    this.createDatabaseAccess(this.mongoAccess, this.app);
  }


  /**
   * Cria Acesso à Database
   *
   * @class Server
   * @method connectDatabase
   */
  public createDatabaseAccess(mongoAccess: MongoAccessModel, app: express.Application){
      // cria conexão e popula objeto de acesso
      this.connectDatabase(mongoAccess, app);
      // configura variaveis
      this.app.locals.mongoAccess = this.mongoAccess;
  }

  /**
   * Popula objeto de acesso à Database
   *
   * @class Server
   * @method connectDatabase
   */
  public connectDatabase(mongoAccess: MongoAccessModel, app: express.Application){
    var mongodb = require('mongodb') , MongoClient = mongodb.MongoClient

    MongoClient.connect(process.env.MONGOHQ_URL|| 'mongodb://localhost:27017', {poolSize: this.poolSize},
         function(err, database) {
  
             mongoAccess.database = database.db('etm-database');
             /* 0 */ mongoAccess.coll.push(mongoAccess.database.collection('users'));
             /* 1 */ mongoAccess.coll.push(mongoAccess.database.collection('keyboards'));
             /* 2 */ mongoAccess.coll.push(mongoAccess.database.collection('configurations'));
             /* 3 */ mongoAccess.coll.push(mongoAccess.database.collection('logs'));
             /* 4 */ //mongoAccess.coll.push(mongoAccess.database.collection('favorites'));
             /* 5 */ //mongoAccess.coll.push(mongoAccess.database.collection('passwords'));
             
        }) 
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    //empty for now
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    //add static paths
    this.app.use(express.static(path.join(__dirname, "public")));

    //configure pug
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "pug");

    //mount logger
    this.app.use(logger("dev"));

    //mount json form parser
    this.app.use(bodyParser.json({limit:'2mb', type:'application/json'}));

    //mount query string parser
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    //mount cookie parser middleware
    this.app.use(cookieParser("SECRET_GOES_HERE"));

    //jwt verify
    this.app.use(jwt({ secret: backendConfig.secret }).unless({path: ['/login', '/logout', '/register']}));

    // catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      if (err.name === 'UnauthorizedError') {
        res.status(401).send('UnauthorizedError');
      } else{
        err.status = 404;
        next(err);
      }
    });

    //error handling
    this.app.use(errorHandler());

    
    // Add headers
    this.app.use(function (req, res, next) {

      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
      //res.setHeader('Access-Control-Allow-Origin', 'http://etm.korp.com.br');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Pass to next layer of middleware
      next();
    });
  
    this.app.use(helmet()); // SECURITY MEASURES

  }

  /**
   * Create and return Router.
   *
   * @class Server
   * @method config
   * @return void
   */
  private routes() {
    let router: express.Router;
    router = express.Router();

    IndexRoute.create(router, this.app);

    this.app.use(router);

  }
}
