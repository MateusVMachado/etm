import { NextFunction, Request, Response } from "express";
import * as moment from 'moment';
import { UserSessionModel } from '../models/userSession.model';
import { BaseRoute } from "../routes/route";
import { isNullOrUndefined } from "util";

export class Logger extends BaseRoute{
    
    
    
    constructor(){
        super();
    }
    
    public logRequests(req: Request, options?: string){
        moment.locale('pt-br');
    }
    
    public logActions(req: Request, res: Response, next: NextFunction, options?: string){
        
    }
    
    
    public logSessionStart(req: Request, res: Response, next: NextFunction, options?: string){
        let userSession = new UserSessionModel();
        let email = req.body['email'];
        let latitude = req.body['latitude'];
        let longitude = req.body['longitude'];
        
        userSession.ip = req.ip;    
        userSession.user = email;
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
        userSession.latitude = latitude;
        userSession.longitude = longitude;
        
        if(res.locals.mongoAccess.coll[3] !== undefined){
            res.locals.mongoAccess.coll[3].find( { $and: [{ "sessDate": userSession.sessDate}, {"user": userSession.user}, {"logout": "notSet"}] }).toArray(function(err, userSessionList) {
                if(userSessionList.length ===0){
                    res.locals.mongoAccess.coll[3].insert(userSession, (err, result) => {
                        // console.log(err || result)
                    })
                }   
            });
        }
        if(!isNullOrUndefined(options) && options=='false'){
            res.status(200).send();
        } 
    }
    
    public logSessionEnd(req: Request, res: Response, next: NextFunction, options?: string){
        let userSession = new UserSessionModel();
        
        userSession.sessDate = moment().format('L');
        userSession.user = req.body['user'];
        
        if(res.locals.mongoAccess.coll[3] !== undefined){
            res.locals.mongoAccess.coll[3].find( { $and: [{ "sessDate": userSession.sessDate}, {"user": userSession.user}, {"logout": "notSet"}] }).toArray(function(err, userSessionList) {
                
                if(userSessionList.length !== 0){
                    
                    userSession.logout = moment().format('HH:mm:ss');
                    
                    let logout = moment().format('HH:mm:ss').split(' ')[0];
                    let logoutParts = logout.split(':');
                    let end = moment([logoutParts[0],logoutParts[1],logoutParts[2]], "HH:mm:ss")
                    
                    let access = userSessionList[0].access.split(' ')[0];
                    let accessParts = access.split(':');
                    let start = moment([accessParts[0],accessParts[1],accessParts[2]], "HH:mm:ss")
                    
                    
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
                    
                    return;
                } else {
                    // console.log("THERE IS NO UNCLOSED ENTRY");
                }
            })
        }        
    }  
    
    
    public getInterval(start, end){
        
        let thisEnd = moment([end[0],end[1],end[2]], "HH:mm:ss")
        let thisStart = moment([start[0],start[1],start[2]], "HH:mm:ss")
        
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
        
        if(res.locals.mongoAccess.coll[3] !== undefined){
            res.locals.mongoAccess.coll[3].find( { $and: [{"user": req.body['user'] }, {"logout": "notSet"} ] } ).toArray(function(err, userSessionList) {
                logger.sumTimeIntervals(userSessionList, userSession, 'layoutEditorIntervals', 'layoutEditorUsage');
                res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                {  $push: {"layoutEditorIntervals" : userSession.layoutEditorIntervals} }, (err, result) => {
                    if(result) {   
                        res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                        {  $set: {"layoutEditorUsage" : userSession.layoutEditorUsage } }, (err, result) => {
                            if(result) {   res.send();   }
                        }); 
                    }
                });    
                
            });
        }             
    }
    
    public logKeyboardIntervals(req: Request, res: Response, next: NextFunction, options?: string){
        let logger = new Logger();
        let userSession = new UserSessionModel();
        userSession = req.body;
        if(res.locals.mongoAccess.coll[3] !== undefined){
            res.locals.mongoAccess.coll[3].find( { $and: [{"user": req.body['user'] }, {"logout": "notSet"} ] } ).toArray(function(err, userSessionList) {
                logger.sumTimeIntervals(userSessionList, userSession, 'keyboardIntervals', 'keyboardUsage');
                res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                {  $push: {"keyboardIntervals" : userSession.keyboardIntervals} }, (err, result) => {
                    if(result) {   
                        res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                        {  $set: {"keyboardUsage" : userSession.keyboardUsage } }, (err, result) => {
                            if(result) {   res.send();   }
                        }); 
                    }
                });    
                
            });
        }             
    }
    
    public logConfigIntervals(req: Request, res: Response, next: NextFunction, options?: string){
        let logger = new Logger();
        let userSession = new UserSessionModel();
        userSession = req.body;
        
        if(res.locals.mongoAccess.coll[3] !== undefined){
            res.locals.mongoAccess.coll[3].find( { $and: [{"user": req.body['user'] }, {"logout": "notSet"} ] } ).toArray(function(err, userSessionList) {
                logger.sumTimeIntervals(userSessionList, userSession, 'configIntervals', 'configUsage');
                res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                {  $push: {"configIntervals" : userSession.configIntervals} }, (err, result) => {
                    if(result) {   
                        res.locals.mongoAccess.coll[3].update({ $and: [ {"user": req.body['user']}, {"logout": "notSet"}]}, 
                        {  $set: {"configUsage" : userSession.configUsage } }, (err, result) => {
                            if(result) {   res.send();   }
                        }); 
                    }
                });    
                
            });         
        }    
    }
    
    
    public sumTimeIntervals(userSessionList, userSession, intervals, usage){
        if(userSessionList[0] === undefined) return;
        
        let logger = new Logger();
        
        let durations = new Array();
        let receivedInParts = userSession[intervals][0].inTime.split(':');
        let receivedOutParts = userSession[intervals][0].outTime.split(':');
        
        let firstInterval = logger.getInterval(receivedInParts, receivedOutParts);
        
        durations.push(firstInterval);
        
        for(let i = 0 ; i < userSessionList[0][intervals].length; i++){
            let inTime = userSessionList[0][intervals][i][0].inTime;
            let outTime = userSessionList[0][intervals][i][0].outTime;
            let interval = logger.getInterval(inTime.split(':'), outTime.split(':'));
            durations.push(interval);
        }
        
        let seconds = 0 , minutes = 0 , hours = 0 ;
        let finalSeconds = '', finalMinutes = '', finalHours = '';
        
        durations.forEach(element => {
            let parts = element.split(':');
            seconds += Number(parts[2]);
            minutes += Number(parts[1]);
            hours += Number(parts[0]);
        });
        
        if(seconds >= 60){
            finalSeconds = (seconds - 60*(Math.floor(seconds/60)) ).toString();
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
        userSession[usage] = totalDuration;
    }
    
    public generateReport(req: Request, res: Response, next: NextFunction, options?: string){
        
    }
    
} 