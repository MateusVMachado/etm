import { NbMenuService } from '@nebular/theme/components/menu/menu.service';
//import { ConfigModalComponent } from '../config/config.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { SideBarService } from './sidebar.service';

import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import { TecladoService } from '../teclado/teclado.service';
import { NbMenuItem } from '@nebular/theme';
import { KeyboardNamesList } from './keyboards-list.model';
import { AuthService } from '../shared/services/auth.services';
//import { GeneralConfigComponent } from '../general-config/general-config.component';

@Component({
  selector: 'app-pages',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements AfterViewInit, OnInit {
  public editorTecladoServiceSubscribe: any;
  public menuServiceSubscribe: any;

  
  public menu: NbMenuItem[] = [];
  public jsonArray = new Array();

  constructor(private menuService: NbMenuService, 
              private router: Router,
              private sideBarService: SideBarService,
              private modalService: NgbModal,
              private editorTecladoService: EditorTecladoService,
              private tecladoService: TecladoService,
              private authService: AuthService)  {  
  } 

  ngAfterViewInit(): void {
 

    this.editorTecladoServiceSubscribe = 
          this.editorTecladoService.subscribeToEditorSubject().subscribe((editor) =>{
    
        this.menuServiceSubscribe = this.menuService.onItemClick()
            .subscribe((result) => { 
                      if ( result.item.target === 'dashboard') {
                        editor.focus();
                        this.editorTecladoServiceSubscribe.unsubscribe();
                        this.router.navigate(['/pages/dashboard']);
                      } else {
                              // PARTE DO TECLADO
                              editor.focus();
                              
                              this.sideBarService.emitSideBarCommand(result.item.target);
                              this.editorTecladoServiceSubscribe.unsubscribe();
                              this.router.navigate(['/pages/editor-teclado']);
                              this.sideBarService.emitSideBarCommand(result.item.target);
                      }
            });  
    });
  }

  ngOnInit() {
    let user = this.authService.getLocalUser();
    this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
        this.menu = this.generateMenuItem(result);
    });
  }

 // public showLargeModal() {
 //   const activeModal = this.modalService.open(ConfigModalComponent, { size: 'lg', container: 'nb-layout' });
 // }

  
  private generateMenuItem(list: KeyboardNamesList){
    let data = list.KeyboardsNames;
    this.jsonArray = [];
    console.log(data.length);
    for(let j=0; j < data.length; j++){
      if(data[j] === 'caps') continue;
      let object = {
        title: data[j],
        target: data[j]
      } 
      this.jsonArray.push(object);
    }
    
    let myJson = [{
        title: 'Teclado',
        icon: 'nb-home', 
        target: 'hello',
        link: '/pages/editor-teclado', 
        home: true,
        children: this.jsonArray
      },
      {
        title: 'Dashboard',
        icon: 'nb-home',
        target: 'dashboard',
      },
      {
        title: 'Configuração',
        icon: 'nb-gear',
        target: 'config',
        children: [
          {
            title: 'Configuração geral',
            icon: 'nb-grid-a',
            //target: 'general-config',
            link: '/pages/general-config', 
          },
          {
            title: 'Editor de layouts',
            icon: 'nb-keypad',
            link: '/pages/layout-editor',
          },
        ]
      }];

     return myJson; 
  };



}

