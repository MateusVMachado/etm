import { User } from "./user";

export class UserAndGPS {
    email: string;
    password: string;
    latitude: string;
    longitude: string;
}

export class TimeIntervalUnit {
    inTime: string;
    outTime: string;
}

export class UserSessionModel {
    

    ip: string;
    user: string;
    access: string;
    logout: string;
    sessDate: string;
    sessDuration: string;
    configIntervals: Array<TimeIntervalUnit>;
    configUsage: string;
    keyboardIntervals: Array<TimeIntervalUnit>;
    keyboardUsage: string;
    layoutEditorIntervals: Array<TimeIntervalUnit>;
    layoutEditorUsage: string;  
    latitude: string;
    longitude: string;
    
}