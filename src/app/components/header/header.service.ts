import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";

@Injectable()
export class HeaderService {
    public headerSubject = new Subject<any>();  

    emitHeaderCommand(command: any) {
        this.headerSubject.next();
    }

    subscribeTosideBarSubject() {
        return this.headerSubject.asObservable();      
    }
}