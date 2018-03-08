import { ProfileEditService } from '../components/profile/profile-edit.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { tap } from 'rxjs/operators/tap';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../components/shared/services/auth.services';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(public authService: AuthService, public router: Router, private profileService: ProfileEditService) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }

}
