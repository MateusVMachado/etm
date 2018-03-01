import { NbMenuService } from '@nebular/theme/components/menu/menu.service';
import { ConfigModalComponent } from '../config/config.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, Component } from '@angular/core';

import { MENU_ITEMS } from './sidebar-itens';
import { Router } from '@angular/router';
import { SideBarService } from './sidebar.service';

import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import { TecladoService } from '../teclado/teclado.service';
import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'app-pages',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements AfterViewInit {
  public editorTecladoServiceSubscribe: any;
  public menuServiceSubscribe: any;

  public menu = MENU_ITEMS;

  constructor(private menuService: NbMenuService, 
              private router: Router,
              private sideBarService: SideBarService,
              private modalService: NgbModal,
              private editorTecladoService: EditorTecladoService,
              private tecladoService: TecladoService)  {
              
              this.tecladoService.subscribeToTecladoSubject().subscribe((result) =>{
                this.menu = result;
              });
    
  } 

  ngAfterViewInit(): void {
    this.editorTecladoServiceSubscribe = 
          this.editorTecladoService.subscribeToEditorSubject().subscribe((editor) =>{
    
        this.menuServiceSubscribe = this.menuService.onItemClick()
            .subscribe((result) => { 
                      if ( result.item.target === 'config') {
                        this.showLargeModal();
                      }
                      if ( result.item.target === 'dashboard') {
                        console.log("dashboard!");
                        editor.focus();
                        this.editorTecladoServiceSubscribe.unsubscribe();
                        this.router.navigate(['/pages/dashboard']);
                      } else {
                              // PARTE DO TECLADO
                              editor.focus();
                              this.sideBarService.emitSideBarCommand(result.item.target);
                              this.editorTecladoServiceSubscribe.unsubscribe();
                              this.router.navigate(['/pages/editor-teclado']);
                      }
            });  
    });
  }

  ngOnInit() {

  }

  public showLargeModal() {
    const activeModal = this.modalService.open(ConfigModalComponent, { size: 'lg', container: 'nb-layout' });
  }

}

