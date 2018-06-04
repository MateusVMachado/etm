import { NextFunction, Request, Response } from "express";
import * as mongoose from 'mongoose';
import { UserModel } from '../models/user.model';
import { BaseRoute } from '../routes/route';

export class User extends BaseRoute{
    
    public getUser(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[0].find({"email": req.query.email}).toArray(function(err, user_list) {
            res.send(user_list[0]);
        });   
    }
    
    public updateUser(req: Request, res: Response, next: NextFunction){
        let user = req.body as UserModel;
        res.locals.mongoAccess.coll[0].find({"_id": mongoose.Types.ObjectId(user._id)}).toArray(function(err, user_list) {
            if(user_list){
                res.locals.mongoAccess.coll[0].update({"_id": mongoose.Types.ObjectId(user._id)}, {"fullName": user.fullName, "email": user.email, "password": user.password, "picture": user.picture }, function(error, result) {
                    console.log("update User");
                    res.status(200).send("");
                });
            }
        }); 
    }
    public updateUserPassword(req: Request, res: Response, next: NextFunction){
        let userEmail = req.body.email;
        let newPassword = req.body.newPassword;
        res.locals.mongoAccess.coll[0].find({"email": userEmail}).toArray(function(err, user_list) {
            if(user_list){
                res.locals.mongoAccess.coll[0].update({"email": userEmail}, { $set: {"password": newPassword }});
                res.status(200).json({ message: 'updated' });
            }
            else{
                res.status(200).json({ message: 'not_updated' });
            }
        }); 
    }
} 