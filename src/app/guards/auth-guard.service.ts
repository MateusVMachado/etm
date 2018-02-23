import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { tap } from 'rxjs/operators/tap';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../components/shared/services/auth.services';
import { JWTtoken } from '../storage';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(public authService: AuthService, public router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }

/*

  canActivate(): boolean {
    //return this.authService.isAuthenticated()
    //  .pipe(
    //    tap(authenticated => {
    //      if (!authenticated) {
    //        this.router.navigate(['auth/login']);
    //      }
    //   }),
    //  );

    //if (!this.authService.isAuthenticated()) {
    //    this.router.navigate(['auth/login']);
        //return true;
    //} else {
    //  this.router.navigate(['pages/dashboard']);
      //return false;
    //}

  }

  */
}
