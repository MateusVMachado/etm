import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import { Component, Input, OnInit } from '@angular/core';

import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { Router } from '@angular/router';
import { JWTtoken } from '../../storage';
@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {


  @Input() position = 'normal';

  private usuario: User;

  userMenu = [{ title: 'Log out' }];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private router: Router,
              private authService: AuthService
            ) {
  }

  ngOnInit() {
    this.usuario = new User();
    this.usuario = this.authService.getUser();
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
    JWTtoken.token = undefined;
    this.router.navigate(["./auth"]);
  }


}
