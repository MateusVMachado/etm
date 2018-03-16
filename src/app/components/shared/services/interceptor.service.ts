import { AuthService } from './auth.services';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpHeaderResponse,
    HttpHeaders,
    HttpInterceptor,
    HttpProgressEvent,
    HttpRequest,
    HttpResponse,
    HttpSentEvent,
    HttpUserEvent,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, ObservableInput } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';

@Injectable()
export class InterceptorService implements HttpInterceptor{

    constructor(private injector: Injector) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authService = this.injector.get(AuthService);
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${authService.getJWT()}`
            }
        });

        console.log(JSON.stringify(request.headers));

        return next.handle(request);
    }

    handle400Error(error) {
        /*if (error && error.status === 400 && error.error && error.error.error === 'invalid_grant') {
            // If we get a 400 and the error message is 'invalid_grant', the token is no longer valid so logout.
            return
        }*/

        return Observable.throw(error);
    }

    handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        return Observable.throw(new Error());
            /*return this.authService.refreshToken()
                .switchMap((newToken: string) => {
                    if (newToken) {
                        this.tokenSubject.next(newToken);
                        return next.handle(this.addToken(this.getNewRequest(req), newToken));
                    }

                    // If we don't get a new token, we are in trouble so logout.
                    return this.logoutUser();
                })
                .catch(error => {
                    // If there is an exception calling 'refreshToken', bad news so logout.
                    return this.logoutUser();
                })
                .finally(() => {
                    this.isRefreshingToken = false;
                });
        } else {
            return this.tokenSubject
                .filter(token => token != null)
                .take(1)
                .switchMap(token => {
                    return next.handle(this.addToken(this.getNewRequest(req), token));
                });
        }*/
    }

}