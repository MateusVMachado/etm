import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../routes/route";
import { KeyboardModel } from '../models/keyboard.model';
import { MongoAccessModel } from "../models/mongoAccess.model";
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import { backendConfig } from '../backend.config';


export class Auth extends BaseRoute{

    public extractToken(req: Request): string {
        //console.log("MARK1");
        let token = undefined;
        let parts: string[] = [];
        if (req.headers && req.headers.authorization) {
            //Authorization: Bearer ZZZ.ZZZ.ZZZ
            parts = req.headers.authorization.toString().split(' ')
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1]
            }
            console.log("PARTS: " + parts[1]);
            //console.log("MARK2");
        }
        return token
    }
}