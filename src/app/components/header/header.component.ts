import { Subscription } from 'rxjs/Rx';
import { HeaderService } from './header.service';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { ProfileComponent } from '../profile/profile.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import {
    Component,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';

import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { viewClassName } from '@angular/compiler';


@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent extends AppBaseComponent implements OnInit, OnDestroy {
  
  @Input() position = 'normal';
  private readonly base64Token = ';base64,';
  public usuario: User;
  public imgUrl;
  private headerSubscription: Subscription;

  userMenu = [{ title: this.messageService.getTranslation('HEADER_ITEM_PERFIL'), tag: 'perfil' }, { title:  this.messageService.getTranslation('HEADER_ITEM_SAIR'), tag: 'sair' }];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private router: Router,
              private authService: AuthService,
              private modalService: NgbModal,
              protected injector: Injector,
			        private http: HttpClient,
              private headerService: HeaderService
            ) { super(injector) 
                this.headerSubscription = this.headerService.subscribeToHeaderSubject().subscribe(()=>{
                    this.userMenu = [{ title: this.messageService.getTranslation('HEADER_ITEM_PERFIL'), tag: 'perfil' }, { title: this.messageService.getTranslation('HEADER_ITEM_SAIR'), tag: 'sair' }];
                });
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
      
    }); 
    window.localStorage.removeItem('JWTtoken')
    this.router.navigate(["./auth"]);
  }

  public sendNow(){
    let user = this.authService.getLocalUser();
    let payload = { "user" : user.email };
    return this.http.post(this.appServiceBase.backendAddress + '/logout' , payload, {responseType: 'text'});
  }
   ngOnDestroy(): void {
    this.headerSubscription.unsubscribe();
  }


  menuItem(item: any){
    if(item.tag === 'sair'){
      this.logout();
    }else if (item.tag === 'perfil'){
      this.router.navigate(["/pages/profile"]);
    }
  }

}
