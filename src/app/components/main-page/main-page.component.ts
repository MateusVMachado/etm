import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.services';
import { Component, OnDestroy, HostListener, Injector } from '@angular/core';
import {
  NbMediaBreakpoint,
  NbMediaBreakpointsService,
  NbMenuItem,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
} from '@nebular/theme';

import { StateService } from '../../data/state.service';

import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/delay';

import { HttpClient } from '@angular/common/http';
import { AppServiceBase } from '../shared/services/app-service-base.service';
import { AppBaseComponent } from '../shared/components/app-base.component';
// TODO: move layouts into the framework
@Component({
  selector: 'app-main-page',
  styleUrls: ['./main-page.component.scss'],
  templateUrl: './main-page.component.html' ,
})
export class MainPageComponent extends AppBaseComponent implements OnDestroy {

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event) {
    this.sendNow().subscribe(()=>{

    });
  }

  @HostListener('window:beforeunload', [ '$event' ])
  beforeUnloadHander(event) {
    //this.sendNow();
  }


  subMenu: NbMenuItem[] = [
    {
      title: 'PAGE LEVEL MENU',
      group: true,
    },
    {
      title: 'Buttons',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/ui-features/buttons',
    },
    {
      title: 'Grid',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/ui-features/grid',
    },
    {
      title: 'Icons',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/ui-features/icons',
    },
    {
      title: 'Modals',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/ui-features/modals',
    },
    {
      title: 'Typography',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/ui-features/typography',
    },
    {
      title: 'Animated Searches',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/ui-features/search-fields',
    },
    {
      title: 'Tabs',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/ui-features/tabs',
    },
  ];
  layout: any = {};
  sidebar: any = {};

  protected layoutState$: Subscription;
  protected sidebarState$: Subscription;
  protected menuClick$: Subscription;

  constructor(protected stateService: StateService,
    protected menuService: NbMenuService,
    protected themeService: NbThemeService,
    protected bpService: NbMediaBreakpointsService,
    protected sidebarService: NbSidebarService,
    private http: HttpClient,
    protected injector: Injector,
    private authService: AuthService,
    private router: Router) {

    super(injector);

    this.layoutState$ = this.stateService.onLayoutState()
      .subscribe((layout: string) => this.layout = layout);

    this.sidebarState$ = this.stateService.onSidebarState()
      .subscribe((sidebar: string) => {
        this.sidebar = sidebar;
      });

    const isBp = this.bpService.getByName('is');
    this.menuClick$ = this.menuService.onItemSelect()
      .withLatestFrom(this.themeService.onMediaQueryChange())
      .delay(20)
      .subscribe(([item, [bpFrom, bpTo]]: [any, [NbMediaBreakpoint, NbMediaBreakpoint]]) => {

        if (bpTo.width <= isBp.width) {
          this.sidebarService.collapse('menu-sidebar');
        }
      });
  }

  ngOnDestroy() {
    this.layoutState$.unsubscribe();
    this.sidebarState$.unsubscribe();
    this.menuClick$.unsubscribe();
  }


  public sendNow(){
    let user = this.authService.getLocalUser();
    let payload = { "user" : user.email };
    return this.http.get(this.appServiceBase.backendAddress + `/logout?user=${user.email}`, { responseType: 'text' });
  }



}
