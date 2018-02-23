import { NbMenuService } from '@nebular/theme/components/menu/menu.service';
import { ConfigModalComponent } from '../config/config.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';

import { MENU_ITEMS } from './sidebar-itens';

@Component({
  selector: 'app-pages',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements AfterViewInit {

  menu = MENU_ITEMS;

  constructor(private modalService: NgbModal, private menuService: NbMenuService)
  {
    
  } 

  ngAfterViewInit(): void {
    this.menuService.onItemClick()
        .subscribe((result) => {
          if ( result.item.target === 'config') {
            this.showLargeModal();
          }
        });
  }

  public showLargeModal() {
        const activeModal = this.modalService.open(ConfigModalComponent, { size: 'lg', container: 'nb-layout' });
        activeModal.componentInstance.modalHeader = 'Configura��es';
    }
}
