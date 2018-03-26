import * as moment from 'moment';
import { BaseRoute } from "../routes/route";
import { UserSessionModel } from '../models/userSession.model';
import { NextFunction, Request, Response, Router } from "express";

export class Logger extends BaseRoute{



    constructor(){
        super();
    }

    public logRequests(req: Request, options?: string){
        moment.locale('pt-br');
        
        console.log("\'" + req.method + " " + req.originalUrl + "\'"  + " from [client] " + req.ip + " --> to [server] " + 
            "em " + moment().format('LLLL') );
            //console.log(req.body);    
    }

    public logActions(req: Request, res: Response, next: NextFunction, options?: string){

    }


    public logSessionStart(req: Request, res: Response, next: NextFunction, options?: string){
        let userSession = new UserSessionModel();
        
        userSession.ip = req.ip;    
        userSession.user = req.body['email'];
        userSession.access = moment().format('HH:mm:ss');
        userSession.logout = "notSet";
        userSession.sessDate = moment().format('L');
        userSession.sessDuration = "notSet";
        userSession.configUsage = "notSet";
        userSession.keyboardUsage = "notSet";
        userSession.layoutEditorUsage = "notSet";

        userSession.configIntervals = new Array();
        userSession.configUsage = "notSet";
        userSession.keyboardIntervals = new Array();
        userSession.keyboardUsage = "notSet";
        userSession.layoutEditorIntervals = new Array();
        userSession.layoutEditorUsage = "notSet";  
    
        
        
        console.log("User e-mail: " + userSession.user + " User IP: " + userSession.ip + " at " + userSession.sessDate + ' ' + userSession.access );
        
        res.locals.mongoAccess.coll[3].find( { $and: [{ "sessDate": userSession.sessDate}, {"user": userSession.user}, {"logout": "notSet"}] }).toArray(function(err, userSessionList) {
                console.log(JSON.stringify(userSessionList) );
                console.log(userSessionList.length);
               if(userSessionList.length ===0){
                        res.locals.mongoAccess.coll[3].insert(userSession, (err, result) => {
                                
                            console.log("log inserido Start\n");
                            console.log("\n");
                            res.send();
                        })
                   
               } else {
                    return;
                }         
            });        
 
    }

    public logSessionEnd(req: Request, res: Response, next: NextFunction, options?: string){
        let userSession = new UserSessionModel();
        
        userSession.sessDate = moment().format('L');
        userSession.user = req.query.user;
        

        res.locals.mongoAccess.coll[3].find( { $and: [{ "sessDate": userSession.sessDate}, {"user": userSession.user}, {"logout": "notSet"}] }).toArray(function(err, userSessionList) {

            if(userSessionList.length !== 0){

                userSession.logout = moment().format('HH:mm:ss');
                          
                let logout = moment().format('HH:mm:ss').split(' ')[0];
                let logoutParts = logout.split(':');
                let end = moment([logoutParts[0],logoutParts[1],logoutParts[2]], "HH:mm:ss")

                let access = userSessionList[0].access.split(' ')[0];
                let accessParts = access.split(':');
                let start = moment([accessParts[0],accessParts[1],accessParts[2]], "HH:mm:ss")
                
                console.log("START: " + start.format('HH:mm:ss'));
                console.log("END: " + end.format('HH:mm:ss'));
                
                let hDiffStr, mDiffStr, sDiffStr;
                let hDiff = Math.abs(start.diff(end, 'hours') );
                let mDiff = Math.abs(start.diff(end, 'minutes') );
                let sDiff = Math.abs(start.diff(end, 'seconds') );

                hDiffStr = hDiff.toString();
                mDiffStr = (mDiff-(hDiff*60)).toString();
                sDiffStr = (sDiff - (hDiff*60*60) - ((mDiff-(hDiff*60))*60)).toString();
            
                if(Number(hDiffStr) < 10){
                    hDiffStr = '0' + hDiffStr;
                }
                if(Number(mDiffStr) < 10){
                    mDiffStr = '0' + mDiffStr;
                }
                if(Number(sDiffStr) < 10){
                    sDiffStr = '0' + sDiffStr;
                }
                let sessDuration = hDiffStr + ':' + mDiffStr + ':' + sDiffStr;
                userSession.sessDuration = sessDuration;
                
                res.locals.mongoAccess.coll[3].update({ $and: [{ "sessDate": userSession.sessDate}, {"user": userSession.user}, {"logout": "notSet"}]}, 
                             {  $set: {"logout" : userSession.logout, "sessDuration" : userSession.sessDuration} }, (err, result) => {
                                res.send();
                })

                //res.send();
                return;
            } else {
                console.log("THERE IS NO UNCLOSED ENTRY");
            }
        })    
    }  


    public getInterval(start, end){
        
        let thisEnd = moment([end[0],end[1],end[2]], "HH:mm:ss")
        let thisStart = moment([start[0],start[1],start[2]], "HH:mm:ss")
        
        console.log("START: " + thisStart.format('HH:mm:ss'));
        console.log("END: " + thisEnd.format('HH:mm:ss'));
        
        let hDiffStr, mDiffStr, sDiffStr;
        let hDiff = Math.abs(thisStart.diff(thisEnd, 'hours') );
        let mDiff = Math.abs(thisStart.diff(thisEnd, 'minutes') );
        let sDiff = Math.abs(thisStart.diff(thisEnd, 'seconds') );

        hDiffStr = hDiff.toString();
        mDiffStr = (mDiff-(hDiff*60)).toString();
        sDiffStr = (sDiff - (hDiff*60*60) - ((mDiff-(hDiff*60))*60)).toString();
    
        if(Number(hDiffStr) < 10){
            hDiffStr = '0' + hDiffStr;
        }
        if(Number(mDiffStr) < 10){
            mDiffStr = '0' + mDiffStr;
        }
        if(Number(sDiffStr) < 10){
            sDiffStr = '0' + sDiffStr;
        }
        let sessDuration = hDiffStr + ':' + mDiffStr + ':' + sDiffStr;
        return sessDuration;
    }

    public logLayoutIntervals(req: Request, res: Response, next: NextFunction, options?: string){
        let logger = new Logger();
        let userSession = new UserSessionModel();
        userSession = req.body;

        console.log("MARK1-A");
        console.log(JSON.stringify(userSession));

        res.locals.mongoAccess.coll[3].find( { $and: [{"user": req.body['user'] }, {"logout": "notSet"} ] } ).toArray(function(err, userSessionList) {
            console.log("MARK1-B");
            logger.sumTimeIntervals(userSessionList, userSession, 'layoutEditorIntervals', 'layoutEditorUsage');
            console.log("MARK1-C");
            res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                             {  $push: {"layoutEditorIntervals" : userSession.layoutEditorIntervals} }, (err, result) => {
                                console.log("MARK1-D");
                            if(result) {   
                                res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                                {  $set: {"layoutEditorUsage" : userSession.layoutEditorUsage } }, (err, result) => {
                                    console.log("MARK1-E");
                                        if(result) {   res.send();   }
                                }); 
                            }
            });    
                   
        });         
    }

    public logKeyboardIntervals(req: Request, res: Response, next: NextFunction, options?: string){
        let logger = new Logger();
        let userSession = new UserSessionModel();
        userSession = req.body;

        console.log('USER SESSION AO RECEBER: ' + JSON.stringify(userSession));
        console.log("MARK2-A");

        res.locals.mongoAccess.coll[3].find( { $and: [{"user": req.body['user'] }, {"logout": "notSet"} ] } ).toArray(function(err, userSessionList) {
            console.log("MARK2-B");
            logger.sumTimeIntervals(userSessionList, userSession, 'keyboardIntervals', 'keyboardUsage');
            console.log("MARK2-C");
            res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                             {  $push: {"keyboardIntervals" : userSession.keyboardIntervals} }, (err, result) => {
                                console.log("MARK2-D");
                            if(result) {   
                                res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                                {  $set: {"keyboardUsage" : userSession.keyboardUsage } }, (err, result) => {
                                    console.log("MARK2-E");
                                        if(result) {   res.send();   }
                                }); 
                            }
            });    
                   
        });         
    }

    public logConfigIntervals(req: Request, res: Response, next: NextFunction, options?: string){
        let logger = new Logger();
        let userSession = new UserSessionModel();
        userSession = req.body;

        console.log('USER SESSION AO RECEBER: ' + JSON.stringify(userSession));
        console.log("MARK3-A");

        res.locals.mongoAccess.coll[3].find( { $and: [{"user": req.body['user'] }, {"logout": "notSet"} ] } ).toArray(function(err, userSessionList) {
            console.log("MARK3-B");
            logger.sumTimeIntervals(userSessionList, userSession, 'configIntervals', 'configUsage');
            console.log("MARK3-C");
            res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                             {  $push: {"configIntervals" : userSession.configIntervals} }, (err, result) => {
                                console.log("MARK3-D");
                            if(result) {   
                                res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                                {  $set: {"configUsage" : userSession.configUsage } }, (err, result) => {
                                    console.log("MARK3-E");
                                        if(result) {   res.send();   }
                                }); 
                            }
            });    
                   
        });         
    }


    public sumTimeIntervals(userSessionList, userSession, intervals, usage){
        console.log(intervals);
        console.log(usage);
        if(userSessionList[0] === undefined) return;
        
        let logger = new Logger();
        
        let durations = new Array();

        console.log("INTERVALO RECEBIDO: (TESTE) ");
        //console.log(userSession.layoutEditorIntervals);
        console.log("MARK4-A");
        console.log(userSession[intervals]);

        console.log("MARK4-B");
        //let receivedInParts = userSession.layoutEditorIntervals[0].inTime.split(':');
        let receivedInParts = userSession[intervals][0].inTime.split(':');
        //let receivedOutParts = userSession.layoutEditorIntervals[0].outTime.split(':');
        let receivedOutParts = userSession[intervals][0].outTime.split(':');
        console.log(receivedInParts);
        console.log(receivedOutParts);

        let firstInterval = logger.getInterval(receivedInParts, receivedOutParts);
        console.log("MARK4-C");
        console.log("FIRST INTERVAL: ");
        console.log(firstInterval);

        console.log("INTERVALO NO DATABASE: ");
        //console.log(userSessionList[0].layoutEditorIntervals);
        //console.log(userSessionList[0][intervals]);
        console.log("ELEMENTOS> ");

        durations.push(firstInterval);
        console.log("MARK4-D");
        //for(let i = 0 ; i < userSessionList[0].layoutEditorIntervals.length; i++){
        for(let i = 0 ; i < userSessionList[0][intervals].length; i++){
            //let inTime = userSessionList[0].layoutEditorIntervals[i][0].inTime;
            let inTime = userSessionList[0][intervals][i][0].inTime;
            //let outTime = userSessionList[0].layoutEditorIntervals[i][0].outTime;
            let outTime = userSessionList[0][intervals][i][0].outTime;
            
            let interval = logger.getInterval(inTime.split(':'), outTime.split(':'));
            
            durations.push(interval);
            //console.log('element ' + inTime + ' ' + outTime + ' Interval: ' + logger.getInterval(inTime.split(':'),outTime.split(':')) );
        }
        
        console.log("MARK4-E");

        console.log('ALL DURATIONS: ');
        console.log(durations);

        let seconds = 0 , minutes = 0 , hours = 0 ;
        let finalSeconds = '', finalMinutes = '', finalHours = '';
        
        durations.forEach(element => {
            let parts = element.split(':');
            seconds += Number(parts[2]);
            minutes += Number(parts[1]);
            hours += Number(parts[0]);
        });
        
        if(seconds >= 60){
            ///arrumar remainder 
            finalSeconds = (seconds - 60*(Math.floor(seconds/60)) ).toString();
            console.log('modulo: ' + seconds % 60);
            minutes = minutes + 1;
            if(finalSeconds.length === 1){
                finalSeconds = '0' + finalSeconds;
            }
        } else {
            finalSeconds = seconds.toString();
            if(finalSeconds.length === 1){
                finalSeconds = '0' + finalSeconds;
            }
        }

        if(minutes >= 60) {
            finalMinutes = (minutes - 60*( Math.floor(minutes/60)  )).toString();
            console.log('modulo: ' + minutes % 60);
            hours = hours + 1;
            if(finalMinutes.length === 1){
                finalMinutes = '0' + finalMinutes;
            }
        } else {
            finalMinutes = minutes.toString();
            if(finalMinutes.length === 1){
                finalMinutes = '0' + finalMinutes;
            }
        }

        finalHours = hours.toString();
        if(finalHours.length === 1){
            finalHours = '0' + finalHours;
        }

        let totalDuration = finalHours + ':' + finalMinutes + ':' + finalSeconds;
        console.log("TOTAL DURATION: ");
        console.log(totalDuration);

        console.log("MARK4-F");
        //userSession.layoutEditorUsage = totalDuration;
        userSession[usage] = totalDuration;
        console.log("MARK4-G");
        console.log('hello');
    }


    public sum2Intervals(first, second){

    }

    public generateReport(req: Request, res: Response, next: NextFunction, options?: string){
        
    }

} 