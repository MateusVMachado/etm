import { Request } from "express";
import { BaseRoute } from "../routes/route";

export class Auth extends BaseRoute {
  public extractToken(req: Request): string {
    let token = undefined;
    let parts: string[] = [];
    if (req.headers && req.headers.authorization) {
      //Authorization: Bearer ZZZ.ZZZ.ZZZ
      parts = req.headers.authorization.toString().split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }
    return token;
  }
}
