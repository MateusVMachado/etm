import { Component, ChangeDetectionStrategy } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'app-pages',
  template: `
    <app-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </app-sample-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagesComponent {

  menu = MENU_ITEMS;
}
