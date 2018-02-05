import { Component, ChangeDetectionStrategy } from '@angular/core';

import { MENU_ITEMS } from './sidebar-itens';

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
export class SidebarComponent {

  menu = MENU_ITEMS;
}
