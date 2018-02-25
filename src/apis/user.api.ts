import { UserModel } from '../models/user.model';
import { BaseRoute } from '../routes/route';
import { NextFunction, Request, Response } from "express";
import * as mongoose from 'mongoose'

export class User extends BaseRoute{

    public getUser(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[0].find({"email": req.query.email}).toArray(function(err, user_list) {
            if(user_list){
                let user: UserModel = new UserModel();
                user = user_list[0];
                res.send(user);
            }
        });
    }

    public updateUser(req: Request, res: Response, next: NextFunction){
        let user = req.body as UserModel;
        console.log(user._id);
        res.locals.mongoAccess.coll[0].find({"_id": mongoose.Types.ObjectId(user._id)}).toArray(function(err, user_list) {
            if(user_list){
                res.locals.mongoAccess.coll[0].update({"_id": mongoose.Types.ObjectId(user._id)}, {"fullName": user.fullName, "email": user.email, "password": user.password, "picture": user.picture });
            }
        });
    }

} 