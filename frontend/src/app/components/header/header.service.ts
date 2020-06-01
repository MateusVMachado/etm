import { Injectable, Injector } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AppServiceBase } from '../shared/services/app-service-base.service';

@Injectable()
export class HeaderService extends AppServiceBase {
    public header: any;
    public headerSubject = new BehaviorSubject<any>(this.header);  

    constructor(protected injector: Injector){
        super(injector);
    }

    emitHeaderCommand(command: any) {
        this.header = command;
        this.headerSubject.next(this.header);
    }

    subscribeToHeaderSubject() {
        return this.headerSubject.asObservable();      
    }
}