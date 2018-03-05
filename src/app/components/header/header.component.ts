import { ProfileService } from '../profile/profile.service';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';

import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {


  @Input() position = 'normal';
  private readonly base64Token = ';base64,';
  private usuario: User;
  private imgUrl;

  userMenu = [{ title: 'Log out' }];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private router: Router,
              private authService: AuthService,
              private zone: NgZone,
              private profileService: ProfileService
            ) {}

  ngOnInit() {    
    this.authService.getObservableUser().subscribe(result =>{
      this.zone.run(() => {
        this.usuario = result;
        if(result.picture.content){
          this.imgUrl = 'data:image/png;base64,'+ result.picture.content;
        }else{
          this.imgUrl = '../../../assets/images/avatarUser.png'
        }
      });
    });
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }

  toggleSettings(): boolean {
    this.sidebarService.toggle(false, 'settings-sidebar');
    return false;
  }

  goToHome() {
    this.menuService.navigateHome();
  }

  logout() {
    window.localStorage.removeItem('JWTtoken')
    this.router.navigate(["./auth"]);
  }


}
