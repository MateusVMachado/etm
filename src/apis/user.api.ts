import { UserModel } from '../models/user.model';
import { BaseRoute } from '../routes/route';
import { NextFunction, Request, Response } from "express";

export class User extends BaseRoute{

    public getUser(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[0].find({"email": req.query.email}).toArray(function(err, user_list) {
            if( user_list.length){
                let user: UserModel = new UserModel();
                user = user_list[0];
                res.send(user);
            }
        });
    }

    public updateUser(req: Request, res: Response, next: NextFunction){
        let user = req.body as UserModel;
        res.locals.mongoAccess.coll[0].find({"email": user.email}).toArray(function(err, user_list) {
            if(user_list.length){
                res.locals.mongoAccess.coll[0].update({ "email": user.email }, {"fullName": user.fullName, "email": user.email, "password": user.password, "picture": user.picture });
                res.status(200);
            }
        });
    }

} 