"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("../routes/route");
const keyboard_model_1 = require("../models/keyboard.model");
class Keyboard extends route_1.BaseRoute {
    constructor() {
        super();
        this.teclado = new keyboard_model_1.KeyboardModel();
        this.teclado.teclas = [];
    }
    keyboard_api(req, res, next) {
        this.title = "Home | ETM - BackEnd";
        this.getInDatabase(this.teclado, res);
    }
    getInDatabase(teclado, res) {
        res.locals.mongoAccess.coll[1].find({}).toArray(function (err, keyboard_list) {
            teclado.teclas = keyboard_list[0].teclas;
            teclado.type = keyboard_list[0].type;
            res.send(teclado);
        });
    }
    insertIntoDatabase(teclado) {
        var mongodb = require('mongodb'), MongoClient = mongodb.MongoClient;
        const myAwesomeDB = '';
        MongoClient.connect(process.env.MONGOHQ_URL || 'mongodb://localhost:27017', function (err, database) {
            var db = database.db('etm-database');
            db.collection('keyboards').insert(teclado, (err, result) => {
                console.log("Keyboard inserido");
            });
        });
    }
    loadKeyboard(type) {
        var row = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
        var pRow = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
        var sRow = ['*cpslck', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', ';', '*kbdrtrn'];
        var tRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\''];
        var crow = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '*bckspc'];
        var cpRow = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
        var csRow = ['*cpslck', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', ':', '*kbdrtrn'];
        var ctRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '\"'];
        this.teclado.teclas = [];
        if (type === 'normal') {
            this.teclado.teclas.push(row);
            this.teclado.teclas.push(pRow);
            this.teclado.teclas.push(sRow);
            this.teclado.teclas.push(tRow);
            this.teclado.type = 'normal';
        }
        else if (type === 'caps') {
            this.teclado.teclas.push(crow);
            this.teclado.teclas.push(cpRow);
            this.teclado.teclas.push(csRow);
            this.teclado.teclas.push(ctRow);
            this.teclado.type = 'caps';
        }
        return this.teclado;
    }
}
exports.Keyboard = Keyboard;
