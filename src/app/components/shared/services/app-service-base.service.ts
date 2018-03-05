import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Injector } from '@angular/core';

@Injectable()
export class AppServiceBase {

    //protected backendAddress: string = 'http://etm-api.korp.com.br/';
    protected frontendAddress: string = 'http://etm.korp.com.br/';
    protected backendAddress: string = 'http://localhost:8080';

    constructor(protected injector: Injector){

    }

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