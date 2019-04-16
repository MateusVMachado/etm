import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AppServiceBase {

    
    public backendAddress: string;
    public frontendAddress: string;

    constructor(protected injector: Injector){
      

        if(environment.production){
            this.backendAddress = 'https://etm-api.korp.com.br';
            this.frontendAddress = 'https://etm.korp.com.br';
        } else {
            this.backendAddress = 'http://localhost:8080';
            this.frontendAddress = 'http://localhost:4200/';
        }
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