import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../routes/route";
import { KeyboardModel } from '../models/keyboard.model';
import { MongoAccessModel } from "../models/mongoAccess.model";
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import { backendConfig } from '../backend.config';

//var jwt = require('jsonwebtoken');

export class Login extends BaseRoute{

    public title: string;
    public user: any = {};

    constructor() {
        super();
    }


    public authenticateUser(req: Request, res: Response, next: NextFunction){
        //var jwt = require('jsonwebtoken');
        this.user.name = "juliana";
        this.user.email = "juliana@gmail.com";
        this.user.password = 'juliana';

        console.log("Checking login informations:")
        //console.log("[server] Rec: " + req.body['token'] );
        console.log(req.body);
        //if(req.body['token'] === "407518f9df56de760624a95a909a23419456ad95bc3b3009c6c5e7cde4b072e05a3d7562eec3ff341d4bcd3e108721e5d96a8b191f6e20d122d2dd330dfc86f9f40c876037706dc2c3733ac00e561d1b8dc83dc6099e7e1192da116489ad7a4f"){
        if( req.body['email'] === this.user.email && req.body['password'] === this.user.password) {    
            console.log("AUTENTICADO!");
           
            let token = jwt.sign({sub: this.user.email, iss: 'etm-app'}, backendConfig.secret);
            //res.send(JSON.stringify("OK!"));
            console.log("[server] Sent: " + token);
            res.json({name: this.user.name, email: this.user.email, accessToken: token});

        } else {
            console.log("NÃO AUTENTICADO");
            //res.send(JSON.stringify("NOT OK!"));
            res.status(403).json({message: 'Dados inválidos.'});
        }
        //console.log(req.body['token']);

        //console.log(req.body['email']);
        //console.log(req.body['password']);   
    }




/*
    public login_api(req: Request, res: Response, next: NextFunction, mongoAccess: MongoAccessModel) {
        //set custom title
        this.title = "Login | ETM - BackEnd";   
      }


    checkLoginDB(res: Response, mongoAccess: MongoAccessModel){
        mongoAccess.coll.find({}).toArray(function(err, keyboard_list) {   
            
        })
     }



    insertIntoDatabase(teclado: KeyboardModel){
        var mongodb = require('mongodb') , MongoClient = mongodb.MongoClient
        const myAwesomeDB = '';
        MongoClient.connect(process.env.MONGOHQ_URL|| 'mongodb://localhost:27017',
             function(err, database) {  
                var db = database.db('keyboards_db');
                db.collection('keyboards').insert(teclado, (err, result) => {
                    console.log("Keyboard inserido")
            })
        })
    }     

*/    
}


