import { NbMenuService } from '@nebular/theme/components/menu/menu.service';
import { ConfigModalComponent } from '../config/config.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, ChangeDetectionStrategy, Component, NgZone } from '@angular/core';

import { MENU_ITEMS } from './sidebar-itens';
import { Router } from '@angular/router';
import { SideBarService } from './sidebar.service';

@Component({
  selector: 'app-pages',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements AfterViewInit {

  menu = MENU_ITEMS;

  constructor(private menuService: NbMenuService, 
              private router: Router,
              private sideBarService: SideBarService,
              private zone: NgZone)  {
    
  } 

  ngAfterViewInit(): void {
    this.menuService.onItemClick()
        .subscribe((result) => {
          if ( result.item.target === 'hello') {
            console.log('Hellooooooo');
            this.router.navigate(['/pages/editor-teclado']);
          }
          if ( result.item.target === 'pt-br') {
            console.log('pt-br');
            this.sideBarService.emitSideBarCommand('pt-br');
            this.router.navigate(['/pages/editor-teclado']);
          }
          if ( result.item.target === 'user') {
            console.log('userDefined-01');
            this.sideBarService.emitSideBarCommand('user');
            this.router.navigate(['/pages/editor-teclado']);
          }
          if ( result.item.target === 'exp') {
            console.log('experimental');
            this.sideBarService.emitSideBarCommand('exp');      
            this.router.navigate(['/pages/editor-teclado']);
          }
        });  
  }


}
