"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const errorHandler = require("errorhandler");
const index_1 = require("./routes/index");
const mongoAcces_model_1 = require("./apis/mongoAcces.model");
class Server {
    constructor() {
        this.mongoAccess = new mongoAcces_model_1.MongoAccessModel();
        this.poolSize = 10;
        this.app = express();
        this.config();
        this.routes();
        this.api();
        this.connectDatabase(this.mongoAccess);
    }
    static bootstrap() {
        return new Server();
    }
    connectDatabase(mongoAccess) {
        var mongodb = require('mongodb'), MongoClient = mongodb.MongoClient;
        MongoClient.connect(process.env.MONGOHQ_URL || 'mongodb://localhost:27017', { poolSize: this.poolSize }, function (err, database) {
            mongoAccess.database = database.db('keyboards_db');
            mongoAccess.coll = mongoAccess.database.collection('keyboards');
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
    }
    routes() {
        let router;
        router = express.Router();
        index_1.IndexRoute.create(router, this.mongoAccess);
        this.app.use(router);
    }
}
exports.Server = Server;
