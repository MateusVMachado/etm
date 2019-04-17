export class TimeIntervalUnit {
    inTime: string;
    outTime: string;
}

export class KeyPressedAt {
    key: string;
    time: string;
    scanTimeOfLines: string;
    scanTimeOfColumns: string;
  }

export class UserSessionModel {
    

    ip: string;
    user: string;
    lastKeyboard: string;
    access: string;
    logout: string;
    sessDate: string;
    sessDuration: string;
    configIntervals: Array<TimeIntervalUnit>;
    configUsage: string;
    keyPressedAt: Array<KeyPressedAt>;
    keyboardIntervals: Array<TimeIntervalUnit>;
    keyboardUsage: string;
    layoutEditorIntervals: Array<TimeIntervalUnit>;
    layoutEditorUsage: string;  
    latitude: string;
    longitude: string;

}