import { ProfileComponent } from '../profile/profile.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileService } from '../profile/profile.service';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnInit, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';

import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { AppServiceBase } from '../shared/services/app-service-base.service';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent extends AppServiceBase implements OnInit {


  @Input() position = 'normal';
  private readonly base64Token = ';base64,';
  private usuario: User;
  private imgUrl;

  userMenu = [{ title: 'Perfil', tag: 'perfil' }, { title: 'Log out', tag: 'sair' }];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private router: Router,
              private authService: AuthService,
              private modalService: NgbModal,
              private http: HttpClient,
              protected injector: Injector
            ) {
              super(injector);
            }

  ngOnInit() {    
    this.authService.getObservableUser().subscribe(result =>{
      this.usuario = result;
      if(result.picture.content){
        this.imgUrl = 'data:image/png;base64,'+ result.picture.content;
      }else{
        this.imgUrl = '../../../assets/images/avatarUser.png'
      }
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
    this.sendNow().subscribe(()=>{
      window.localStorage.removeItem('JWTtoken')
      this.router.navigate(["./auth"]);
    }); 
    window.localStorage.removeItem('JWTtoken')
    this.router.navigate(["./auth"]);
  }

  public sendNow(){
    let user = this.authService.getLocalUser();
    let payload = { "user" : user.email };
    return this.http.get(this.backendAddress + `/logout?user=${user.email}`, { responseType: 'text' });
  }


  menuItem(item: any){
    if(item.tag === 'sair'){
      this.logout();
    }else {
      if(item.tag === 'perfil'){
        this.router.navigate(["/pages/profile"]);
      }
    }
  }

}
