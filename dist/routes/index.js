"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("./route");
const keyboard_api_1 = require("../apis/keyboard.api");
class IndexRoute extends route_1.BaseRoute {
    constructor() {
        super();
        this.keyboard = new keyboard_api_1.Keyboard();
    }
    static create(router, mongoAccess) {
        console.log("[IndexRoute::create] Creating index route.");
        router.get("/", (req, res, next) => {
            new IndexRoute().index(req, res, next);
        });
        router.get("/keyboard", (req, res, next) => {
            new IndexRoute().keyboard.keyboard_api(req, res, next, mongoAccess);
        });
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
