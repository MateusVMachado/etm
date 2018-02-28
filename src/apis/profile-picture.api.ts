import { UserModel } from '../models/user.model';
import { BaseRoute } from '../routes/route';
import { NextFunction, Request, Response } from "express";

export class ProfilePicture extends BaseRoute{
    public getUserProfilePicture(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[0].find({"email": req.query.email}).toArray(function(err, user_list) {
            if(user_list){
                let user: UserModel = new UserModel();
                user = user_list[0];
                if(user.picture){
                    let img = new Buffer(user.picture.content, 'base64');
                    res.writeHead(200, {
                        'Content-Type': 'image/png',
                        'Content-Length': img.length
                    });
                    res.end(img);
                } else{
                    res.send(null)
                }
            }
        });
    }
}
