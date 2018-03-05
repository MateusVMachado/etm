import { NextFunction, Request, Response } from "express";

export class BaseRoute {

  protected title: string;

  private scripts: string[];

  constructor() {
    //initialize variables
    this.title = "ETM - BackEnd";
    this.scripts = [];
  }

  public addScript(src: string): BaseRoute {
    this.scripts.push(src);
    return this;
  }

  public render(req: Request, res: Response, view: string, options?: Object) {    
    res.locals.BASE_URL = "/";
    
    res.locals.scripts = this.scripts;

    res.locals.title = this.title;
    
    res.render(view, options);
  }
}