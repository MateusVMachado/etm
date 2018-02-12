import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../routes/route";
import * as mongoSanitize from 'express-mongo-sanitize';
import { UserModel } from '../models/user.model';

export class Register extends BaseRoute {
    

    constructor(){
        super();
    }

    public registerUser(req: Request, res: Response, next: NextFunction){
        console.log("REGISTRO");
        if(this.checkIfAlreadyExists(req, res)){
            console.log("Esse email já foi cadastrado!");
            res.status(400).json({message: 'Esse email já foi cadastrado!'});
        } else {
            this.insertIntoDatabase(req, res);
            console.log("Usuário cadastrado com sucesso!");
            res.status(200).json({message: 'Registro feito com sucesso.'});
            // send confirmation email?
        }
        
        
    }

    private checkIfAlreadyExists(req: Request, res: Response): any {  
            res.locals.mongoAccess.coll[0].find({"email": req.body['email']}).toArray(function(err, user_list) {         
                    if(user_list.length !== 0){
                        console.log("USER FOUND!");
                        console.log(user_list);
                        return true;
                    } else {
                        console.log("USER NOT FOUND!");
                        return false;
                    }
            })

     }


    private insertIntoDatabase(req: Request, res: Response){
        let user = new UserModel();
        user.fullName = req.body['fullName'];
        user.email = req.body['email'];
        user.password = req.body['password'];

        // Remove caracteres indesejados do input do usuário    
        mongoSanitize.sanitize(user.fullName);
        mongoSanitize.sanitize(user.email);
        mongoSanitize.sanitize(user.password);

        res.locals.mongoAccess.coll[0].insert(user, (err, result) => {
            console.log(user);
            console.log("Usuário inserido na database!");
        });  
        /*  
        var mongodb = require('mongodb') , MongoClient = mongodb.MongoClient
        const myAwesomeDB = '';
        MongoClient.connect(process.env.MONGOHQ_URL|| 'mongodb://localhost:27017',
             function(err, database) {  
                var db = database.db('etm-database');
                db.collection('keyboards').insert(user, (err, result) => {
                    console.log("Keyboard inserido")
            })
        })
        */
    }     


}
