import { NextFunction, Request, Response } from "express";
import * as mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { BaseRoute } from "../routes/route";
import { isNullOrUndefined } from "util";

export class User extends BaseRoute {
  public getUser(req: Request, res: Response, next: NextFunction) {
    this.getMongoAccess(res)
      .users()
      .subscribe(userCollection => {
        userCollection
          .find({ email: req.query.email })
          .toArray(function(err, user_list) {
            if (user_list && user_list.length > 0) res.send(user_list[0]);
            else res.status(200).send();
          });
      });
  }

  public updateUser(req: Request, res: Response, next: NextFunction) {
    let user = req.body as UserModel;

    this.getMongoAccess(res)
      .users()
      .subscribe(userCollection => {
        userCollection
          .find({ _id: mongoose.Types.ObjectId(user._id) })
          .toArray(function(err, user_list) {
            if (user_list) {
              userCollection.update(
                { _id: mongoose.Types.ObjectId(user._id) },
                {
                  fullName: user.fullName,
                  email: user.email,
                  password: user.password,
                  picture: user.picture
                },
                function(error, result) {
                  res.status(200).send("");
                }
              );
            }
          });
      });
  }
  public updateUserPassword(req: Request, res: Response, next: NextFunction) {
    let userEmail = req.body.email;
    let newPassword = req.body.newPassword;

    this.getMongoAccess(res)
      .users()
      .subscribe(userCollection => {
        userCollection
          .find({ email: userEmail })
          .toArray(function(err, user_list) {
            if (user_list) {
              userCollection.update(
                { email: userEmail },
                { $set: { password: newPassword } }
              );
              res.status(200).json({ message: "updated" });
            } else {
              res.status(200).json({ message: "not_updated" });
            }
          });
      });
  }
}
