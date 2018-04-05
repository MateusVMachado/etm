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
        let email = req.body['email'];
        let password = req.body['password'];

            if(res.locals.mongoAccess.coll[0]){
                res.locals.mongoAccess.coll[0].find({"email": email}).toArray(function(err, user_list) {         
                        if(user_list.length !== 0){
                            if (email === user_list[0]['email'] && 
                                password === user_list[0]['password']) {
                                let token = jwt.sign({ sub: user_list[0]['email'], iss: 'etm-app' }, 
                                            backendConfig.secret, {expiresIn: 86400}); //1 dia
                                
                                let response = new LoginAuthenticate();
                                response.name = user_list[0]['fullName'];
                                response.email = user_list[0]['email'];
                                response.accessToken = token;
                                res.json(response);
                
                            } else {
                                console.log("NÃO AUTENTICADO");
                                res.status(403).json({ message: 'MENSAGEM_DADOS_INVALIDOS' });
                            }

                            console.log(user_list[0]['email']);
                            
                        } else {
                            console.log("USER NOT FOUND!");
                            res.status(400).json({message: 'MENSAGEM_DADOS_INVALIDOS'});
                        } 
                });     
            }        
    }
}        
