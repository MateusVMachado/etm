"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const errorHandler = require("errorhandler");
const helmet = require("helmet");
const index_1 = require("./routes/index");
const mongoAccess_model_1 = require("./models/mongoAccess.model");
const login_api_1 = require("./apis/login.api");
class Server {
    constructor() {
        this.mongoAccess = new mongoAccess_model_1.MongoAccessModel();
        this.poolSize = 10;
        this.guard = new login_api_1.Login();
        this.app = express();
        this.config();
        this.routes();
        this.api();
        this.createDatabaseAccess(this.mongoAccess, this.app);
    }
    static bootstrap() {
        return new Server();
    }
    createDatabaseAccess(mongoAccess, app) {
        this.connectDatabase(mongoAccess, app);
        this.app.locals.mongoAccess = this.mongoAccess;
    }
    connectDatabase(mongoAccess, app) {
        var mongodb = require('mongodb'), MongoClient = mongodb.MongoClient;
        MongoClient.connect(process.env.MONGOHQ_URL || 'mongodb://localhost:27017', { poolSize: this.poolSize }, function (err, database) {
            mongoAccess.database = database.db('etm-database');
            mongoAccess.coll.push(mongoAccess.database.collection('users'));
            mongoAccess.coll.push(mongoAccess.database.collection('keyboards'));
            mongoAccess.coll.push(mongoAccess.database.collection('configurations'));
            mongoAccess.coll.push(mongoAccess.database.collection('favorites'));
            mongoAccess.coll.push(mongoAccess.database.collection('passwords'));
            mongoAccess.coll.push(mongoAccess.database.collection('logs'));
        });
    }
    api() {
    }
    config() {
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "pug");
        this.app.use(logger("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cookieParser("SECRET_GOES_HERE"));
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        this.app.use(errorHandler());
        this.app.use(function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            next();
        });
        this.app.use(helmet());
    }
    routes() {
        let router;
        router = express.Router();
        index_1.IndexRoute.create(router, this.app);
        this.app.use(router);
    }
}
exports.Server = Server;
