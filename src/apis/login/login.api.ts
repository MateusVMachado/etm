import {LoginAuthenticate } from './login-authenticate.model';
import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../../routes/route";
import { KeyboardModel } from '../../models/keyboard.model';
import { MongoAccessModel } from "../../models/mongoAccess.model";
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import { backendConfig } from '../../backend.config';


//var jwt = require('jsonwebtoken');

export class Login extends BaseRoute{

    public title: string;
    public user: any = {};

    constructor() {
        super();
    }

    public authenticateUser(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[0].find({"email": req.body['email']}).toArray(function(err, user_list) {         
                if(user_list.length !== 0){
                    console.log("USER FOUND!");

                    if (req.body['email'] === user_list[0]['email'] && 
                        req.body['password'] === user_list[0]['password']) {
                        console.log("AUTENTICADO!");
        
                        let token = jwt.sign({ sub: user_list[0]['email'], iss: 'etm-app' }, 
                                    backendConfig.secret, {expiresIn: 86400}); //1 dia
                        
                        console.log("[server] Sent: " + token);
                        let response = new LoginAuthenticate();
                        response.name = user_list[0]['fullName'];
                        response.email = user_list[0]['email'];
                        response.accessToken = token;
                        res.json(response);
        
                    } else {
                        console.log("NÃO AUTENTICADO");
                        res.status(403).json({ message: 'Dados inválidos.' });
                    }

                    console.log(user_list[0]['email']);
                    //console.log("MARK2");
                    
                } else {
                    console.log("USER NOT FOUND!");
                    res.status(400).json({message: 'Dados inválidos!'});
                }
 
        });
    }
}        
/*
    private checkIfExistsAndReturn(req: Request, res: Response): any {
        //this.user = {};  
        res.locals.mongoAccess.coll[0].find({"email": req.body['email']}).toArray(function(err, user_list) {         
                if(user_list.length !== 0){
                    console.log("USER FOUND!");
                    console.log(user_list);
                    //this.user.fullName = user_list[0]['fullName'];
                    //this.user.email = user_list[0]['email'];
                    //this.user.password = user_list[0]['password'];
                    console.log(user_list[0]['email']);
                    console.log("MARK2");
                    //this.user.fullName = user_list
                    return true;
                } else {
                    console.log("USER NOT FOUND!");
                    res.status(400).json({message: 'Dados incorretos!'});
                    return false;
                }
        })

 }
*/

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
