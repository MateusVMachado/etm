import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan"; // Para modo desenvolvimento apenas
import * as path from "path";
import * as errorHandler from "errorhandler"; // Para modo desenvolvimento apenas

import { IndexRoute } from "./routes/index";
import { MongoAccessModel } from "./apis/mongoAcces.model";


/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

  public mongoAccess: MongoAccessModel = new MongoAccessModel();
  public poolSize: number = 10;

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

    //configure application
    this.config();

    //add routes
    this.routes();

    //add api
    this.api();

     // Cria pool de conexões 
    this.connectDatabase(this.mongoAccess);
  }


  /**
   * Cria Objeto de acesso à Database
   *
   * @class Server
   * @method connectDatabase
   */
  connectDatabase(mongoAccess: MongoAccessModel){
    var mongodb = require('mongodb') , MongoClient = mongodb.MongoClient

    MongoClient.connect(process.env.MONGOHQ_URL|| 'mongodb://localhost:27017', {poolSize: this.poolSize},
         function(err, database) {
          /////////////////////////////////  
         // TORNAR AS BASES GENÉRICAS!! //
        /////////////////////////////////
             mongoAccess.database = database.db('keyboards_db');
             mongoAccess.coll = mongoAccess.database.collection('keyboards')
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
    this.app.use(bodyParser.json());

    //mount query string parser
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    //mount cookie parser middleware
    this.app.use(cookieParser("SECRET_GOES_HERE"));

    // catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
      err.status = 404;
      next(err);
    });

    //error handling
    this.app.use(errorHandler());

    
    // Add headers
    this.app.use(function (req, res, next) {

      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Pass to next layer of middleware
      next();
    });
  

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

    //IndexRoute
    IndexRoute.create(router, this.mongoAccess);

    //use router middleware
    this.app.use(router);
  }
}
