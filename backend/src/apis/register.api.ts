import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../routes/route";
import * as mongoSanitize from "express-mongo-sanitize";
import { UserModel } from "../models/user.model";
import { Configuration } from "./configuration.api";

export class Register extends BaseRoute {  

  constructor() {
    super();
  }

  public registerUser(req: Request, res: Response, next: NextFunction) {

    this.getMongoAccess(res)
      .users()
      .subscribe(userCollection => {
        userCollection
          .find({ email: req.body["email"] })
          .toArray(function(err, user_list) {
            if (user_list.length !== 0) {
              // console.log("Esse email já foi cadastrado!");
              res
                .status(400)
                .json({ message: "Esse email já foi cadastrado!" });
            } else {
              // console.log("USER NOT FOUND!");

              let user = new UserModel();
              user.fullName = req.body["fullName"];
              user.email = req.body["email"];
              user.password = req.body["password"];

              // Remove caracteres indesejados do input do usuário
              mongoSanitize.sanitize(user.fullName);
              mongoSanitize.sanitize(user.email);
              mongoSanitize.sanitize(user.password);
              
              userCollection.insert(user, (err, result) => {
                  if(result){
                    const configuration = new Configuration();
                    configuration.defaultConfig(res, req.body["email"], function() {                   
                      res.status(200).json({ message: "Registro feito com sucesso." });
                      }
                    );
                  }else{
                      res.status(500).json({message: "Houve um problema ao realizar o registro"});
                  }
              });
            }
          });
      });
  }
}