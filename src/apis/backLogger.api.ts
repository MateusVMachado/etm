import * as moment from 'moment';
import { BaseRoute } from "../routes/route";
import { Request } from 'express-serve-static-core';

export class BackLogger extends BaseRoute{

    constructor(){
        super();
    }

    public logRequests(req: Request, options?: string){
        moment.locale('pt-br');
        
        console.log("\'" + req.method + " " + req.originalUrl + "\'"  + " from [client] " + req.ip + " --> to [server] " + 
            "em " + moment().format('LLLL') );
            //console.log(req.body);    
    }

}