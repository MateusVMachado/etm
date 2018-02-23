import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AppServiceBase {
    protected handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            return new ErrorObservable(error.error.message);            
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            return new ErrorObservable(error.error);
        }          
    }
}