import {LoginAuthenticate } from './login-authenticate.model';
import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../../routes/route";
import { KeyboardModel } from '../../models/keyboard.model';
import { MongoAccessModel } from "../../models/mongoAccess.model";
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import { backendConfig, emailConfig } from '../../backend.config';

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
                        // console.log("NÃO AUTENTICADO");
                        //res.send('Dados inválidos');
                        res.status(403).json({ message: 'Dados inválidos.' });
                    }
                    
                } else {
                    // console.log("USER NOT FOUND!");
                    res.status(400).json({message: 'Dados inválidos!'});
                } 
            });     
        }        
    }
    
    public isAccountBlocked(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[6].find({"email": req.query.email}).toArray(function(err, listaBloqueados) {
            if(listaBloqueados.length !== 0){
                if(listaBloqueados.length == 1){
                    if( new Date(listaBloqueados[0].desbloqueio) > new Date() ){
                        res.json({status : 'true'})
                    }
                    else{
                        res.json({status : listaBloqueados.length})
                    }
                }
                else{
                    let bloqueado = false
                    listaBloqueados.forEach(element => {
                        if( new Date(element.desbloqueio) > new Date() ){
                            bloqueado = true;
                        }
                    });
                    if(bloqueado){
                        res.json({status : 'true'})
                    }
                    else{
                        res.json({status : listaBloqueados.length})
                    }
                }
            }
            else{
                res.json({status : 'false'})
            }
        });        
    }
    public blockAccount(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[6].insert({"email": req.query.email, "desbloqueio": req.query.desbloqueio}, (err, result) => {
            res.status(200).send();
        });  
    }
    
    public emailRequestPassword(req: Request, res: Response, next: NextFunction){
        let email = req.body["email"];
        let emailHostName = req.body["emailHostName"];
        let emailTitulo = req.body["emailTitulo"];
        let emailAssunto = req.body["emailAssunto"];
        let emailBody = req.body["emailBody"];
        let emailServer = require("emailjs");
        
        let server = emailServer.server.connect({
            user: emailConfig.user, 
            password:emailConfig.password, 
            host: emailConfig.host, 
            ssl: true
        });
        let emailReal = {
            text: emailTitulo,
            from: emailHostName + '<' + emailConfig.hostEmail + '>',
            to: '<' + email + '>' ,
            subject: emailAssunto,
            attachment: 
            [
                {data: emailBody, alternative:true}
            ]
        };
        server.send(emailReal, function(err, message) {});
    }
}        
