import { Component, ChangeDetectionStrategy } from '@angular/core';

import { MENU_ITEMS } from './sidebar-itens';

@Component({
  selector: 'app-pages',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {

  menu = MENU_ITEMS;
}
