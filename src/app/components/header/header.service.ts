import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Injectable()
export class HeaderService {
    public header: any;
    public headerSubject = new BehaviorSubject<any>(this.header);  

    emitHeaderCommand(command: any) {
        this.header = command;
        this.headerSubject.next(this.header);
    }

    subscribeToHeaderSubject() {
        return this.headerSubject.asObservable();      
    }
}