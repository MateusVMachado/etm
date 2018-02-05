import { Component, ChangeDetectionStrategy } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'app-pages',
  template: `
    <app-main-page>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </app-main-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesComponent {

  menu = MENU_ITEMS;
}
