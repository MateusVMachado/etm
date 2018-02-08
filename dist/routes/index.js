"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
const keyboard_api_1 = require("../apis/keyboard.api");
const backLogger_api_1 = require("../apis/backLogger.api");
const login_api_1 = require("../apis/login.api");
const auth_api_1 = require("../apis/auth.api");
class IndexRoute extends route_1.BaseRoute {
    static create(router, app) {
        var newIndexRoute = new IndexRoute();
        var backLogger = new backLogger_api_1.BackLogger();
        var keyboard = new keyboard_api_1.Keyboard();
        var login = new login_api_1.Login();
        var auth = new auth_api_1.Auth();
        console.log("[Server is UP and listening]\n");
        router.get("/", (req, res, next) => {
            res.locals.mongoAccess = app.locals.mongoAccess;
            backLogger.logRequests(req);
            newIndexRoute.index(req, res, next);
        });
        router.post("/login", (req, res, next) => {
            res.locals.mongoAccess = app.locals.mongoAccess;
            console.log("LOGGER NO POST");
            backLogger.logRequests(req);
            login.authenticateUser(req, res, next);
        });
        router.all("/secret", (req, res, next) => {
            res.locals.mongoAccess = app.locals.mongoAccess;
            backLogger.logRequests(req);
            auth.authorizeUser(req, res, next);
        });
        router.get("/keyboard", (req, res, next) => {
            res.locals.mongoAccess = app.locals.mongoAccess;
            console.log("LOGGER NO GET");
            backLogger.logRequests(req);
            keyboard.keyboard_api(req, res, next);
        });
    }
    constructor() {
        super();
    }
    index(req, res, next) {
        this.title = "Home | ETM - BackEnd";
        let options = {
            "message": "Data service active.",
            "payload": ""
        };
        this.render(req, res, "index", options);
    }
}
exports.IndexRoute = IndexRoute;
