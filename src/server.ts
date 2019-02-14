import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan"; // Para modo desenvolvimento apenas
import * as path from "path";
import * as errorHandler from "errorhandler"; // Para modo desenvolvimento apenas
import * as helmet from 'helmet';
import * as jwt from 'express-jwt';

import { words_pt_br } from './default_configs/predictor_pt_br_data'

import { IndexRoute } from "./routes/index";
import { MongoAccessModel } from "./models/mongoAccess.model";
import { Login } from './apis/login/login.api';
import { backendConfig } from  './backend.config';
var MongoClient = require('mongodb').MongoClient;

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  private mongoAccess: MongoAccessModel;
  public app: express.Application;

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
    this.createDatabaseAccess(this.app);

    // Automatically create predictor_pt_br collection and insert documents
    // into it if it doesn't exist
    // this.app.locals.mongoAccess.mongoClient.connect(
    //   'mongodb://localhost:27017/etm-database',
    //   // { useNewUrlParser: true },
    //   (err, client) => {

    //     if (err) throw err;

    //     client.db().collections(
    //       (err, colls) => {

    //         if (err) throw err;

    //         let colf = colls.filter(col => {return col.s.name === 'predictor_pt_br'})

    //         if(colf.length === 0) { // 'predictor_pt_br' collection doesn't exist

    //           console.log("Creating predictor_pt_br collection");

    //           //client.db().createCollection('testing_name');
    //           // apparently the line below already creates it automatically
    //           // so adding this makes things worse

    //           // bulk insertion is a lot faster than individually inserting documents
    //           let bulk = client.db().collection('predictor_pt_br').initializeUnorderedBulkOp();

    //           let count = 0;
    //           let total = words_pt_br.length;

    //           console.time('Time elapsed');

    //           words_pt_br.forEach( word => {
    //             bulk.insert({
    //               rank: 0,
    //               word: word,
    //               addedByUser: false,
    //             })

    //             // fancy shmancy progress thing
    //             count++;
    //             process.stdout.write(((count / total) * 100).toFixed(1) +'% | ' + count + ' documents inserted' +'\r');

    //           })

    //           process.stdout.write('\n'); // newline when it's done inserting

    //           // another fancy console log
    //           process.stdout.write("Executing bulk...");
    //           bulk.execute();
    //           process.stdout.write(" Done!" + '\n');

    //           console.timeEnd('Time elapsed');

    //         } else { // 'predictor_pt_br' collection exists

    //           // do nothing

    //         }

    //       }
    //     )
    //   }
    // );

    // this.app.locals.mongoAccess.mongoClient.connect(
    //   'mongodb://localhost:27017/etm-database',
    //   { useNewUrlParser: true },
    //   (err, client) => {
    //     if (err) throw err;
    //     client.db().collections(
    //       (err, colls) => {
    //         if (err) throw err;
    //         let colf = colls.filter(col => {return col.s.name === 'predictor_local_pt_br'})
    //         if(colf.length === 0) {
    //           client.db().createCollection('predictor_local_pt_br');
    //           console.log('Created predictor_local_pt_br collection');
    //         }
    //       }
    //     )
    //   }
    // );

  }


  /**
   * Cria Acesso à Database
   *
   * @class Server
   * @method connectDatabase
   */
  public createDatabaseAccess(app: express.Application){
    this.mongoAccess = new MongoAccessModel(MongoClient)
    // configura variaveis
    this.app.locals.mongoAccess = this.mongoAccess;
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
    //this.app.use(jwt({ secret: backendConfig.secret }).unless({path: ['/login', '/logout', '/register', '/configuration', '/user', '/keyboard/insertBasicIntoDatabase']}));
    this.app.use(jwt({ secret: backendConfig.secret }).unless({path: ['/login', '/logout', '/register',
     '/configuration', '/user', '/sendEmail','/isAccountBlocked', '/updateUserPassword','/blockAccount']}));

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
      //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
      res.setHeader('Access-Control-Allow-Origin', 'https://etm.korp.com.br');

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
