import { NbMenuService } from '@nebular/theme/components/menu/menu.service';
import { ConfigModalComponent } from '../config/config.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, Component } from '@angular/core';

import { MENU_ITEMS } from './sidebar-itens';
import { Router } from '@angular/router';
import { SideBarService } from './sidebar.service';

import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';

@Component({
  selector: 'app-pages',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements AfterViewInit {
  public editorTecladoServiceSubscribe: any;
  public menuServiceSubscribe: any;

  menu = MENU_ITEMS;

  constructor(private menuService: NbMenuService, 
              private router: Router,
              private sideBarService: SideBarService,
              private modalService: NgbModal,
              private editorTecladoService: EditorTecladoService)  {
    
  } 

  ngAfterViewInit(): void {
    console.log("SIDEBAR INIT!!!");
    this.editorTecladoServiceSubscribe = 
          this.editorTecladoService.subscribeToEditorSubject().subscribe((editor) =>{
    
        this.menuServiceSubscribe = this.menuService.onItemClick()
            .subscribe((result) => {
                    console.log("ONclick!");
                    ////////////////////////////
                    // TORNAR GENÉRICO !!! /////
                  ////////////////////////////  
                      if ( result.item.target === 'config') {
                        this.showLargeModal();
                      }
                      if ( result.item.target === 'pt-br') {
                        editor.focus();
                        this.sideBarService.emitSideBarCommand('pt-br');
                        this.editorTecladoServiceSubscribe.unsubscribe();
                        this.router.navigate(['/pages/editor-teclado']);

                      }
                      if ( result.item.target === 'user') {
                        editor.focus();
                        this.sideBarService.emitSideBarCommand('user');
                        this.editorTecladoServiceSubscribe.unsubscribe();
                        this.router.navigate(['/pages/editor-teclado']);
                      }
                      if ( result.item.target === 'exp') {
                        editor.focus();
                        this.sideBarService.emitSideBarCommand('exp');         
                        this.editorTecladoServiceSubscribe.unsubscribe();
                        this.router.navigate(['/pages/editor-teclado']);
                      }
                      if ( result.item.target === 'dashboard') {
                        editor.focus();
                        this.editorTecladoServiceSubscribe.unsubscribe();
                        this.router.navigate(['/pages/dashboard']);
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

