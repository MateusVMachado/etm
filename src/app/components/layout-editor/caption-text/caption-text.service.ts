import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class CaptionTextService {

    public captionTextSubject = new Subject<any>(); 

    public emitCaptionText(msg: any) {
        this.captionTextSubject.next(msg);
    }
      
    
    public subscribeToCaptionTextSubject() {
          return this.captionTextSubject.asObservable();      
    }


}