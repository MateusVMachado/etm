"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("../routes/route");
const keyboard_model_1 = require("./keyboard.model");
class Keyboard extends route_1.BaseRoute {
    constructor() {
        super();
        this.teclado = new keyboard_model_1.KeyboardModel();
        this.teclado.teclas = [];
    }
    keyboard_api(req, res, next, mongoAccess) {
        this.title = "Home | ETM - BackEnd";
        this.getInDatabase(this.teclado, res, mongoAccess);
    }
    getInDatabase(teclado, res, mongoAccess) {
        mongoAccess.coll.find({}).toArray(function (err, keyboard_list) {
            teclado.teclas = keyboard_list[0].teclas;
            teclado.type = keyboard_list[0].type;
            res.send(teclado);
        });
    }
    insertIntoDatabase(teclado) {
        var mongodb = require('mongodb'), MongoClient = mongodb.MongoClient;
        const myAwesomeDB = '';
        MongoClient.connect(process.env.MONGOHQ_URL || 'mongodb://localhost:27017', function (err, database) {
            var db = database.db('keyboards_db');
            db.collection('keyboards').insert(teclado, (err, result) => {
                console.log("Keyboard inserido");
            });
        });
    }
}
exports.Keyboard = Keyboard;
