import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../routes/route";
import * as mongoSanitize from 'express-mongo-sanitize';
import { UserModel } from '../models/user.model';

export class Register extends BaseRoute {

    constructor(){
        super();
    }

    public registerUser(req: Request, res: Response, next: NextFunction){
        this.getMongoAccess(res)
      .users()
      .subscribe(userCollection => {

        userCollection.find({"email": req.body['email']}).toArray(function(err, user_list) {         
            if(user_list.length !== 0){
                // console.log("Esse email já foi cadastrado!");
                res.status(400).json({message: 'Esse email já foi cadastrado!'});
                return true;
            } else {
                // console.log("USER NOT FOUND!");

                let user = new UserModel();
                user.fullName = req.body['fullName'];
                user.email = req.body['email'];
                user.password = req.body['password'];
        
                // Remove caracteres indesejados do input do usuário    
                mongoSanitize.sanitize(user.fullName);
                mongoSanitize.sanitize(user.email);
                mongoSanitize.sanitize(user.password);
        
                res.locals.mongoAccess.coll[0].insert(user, (err, result) => {

                    // console.log("Usuário inserido na database!");
                });  

                // console.log("Usuário cadastrado com sucesso!");
                res.status(200).json({message: 'Registro feito com sucesso.'});
                return false;
            }
    })

      });
        
        
    }
}