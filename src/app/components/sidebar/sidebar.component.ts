import { AfterViewInit, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbMenuItem } from '@nebular/theme';
import { NbMenuService } from '@nebular/theme/components/menu/menu.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { AuthService } from '../shared/services/auth.services';
import { TecladoService } from '../teclado/teclado.service';
import { KeyboardNamesList } from './keyboards-list.model';
import { SideBarService } from './sidebar.service';





@Component({
  selector: 'app-pages',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent extends AppBaseComponent implements AfterViewInit, OnInit, OnDestroy {
  public editorTecladoServiceSubscribe: any;
  public menuServiceSubscribe: any;
  public sidebarServiceSubscribe: Subscription;
  private loadKeyboardsNamesSubscription : Subscription

  
  public menu: NbMenuItem[] = [];
  public jsonArray = new Array();

  constructor(private menuService: NbMenuService, 
              private router: Router,
              private sideBarService: SideBarService,
              private modalService: NgbModal,
              private editorTecladoService: EditorTecladoService,
              private tecladoService: TecladoService,
              private authService: AuthService,
              private injector: Injector)  {  
                super(injector)

                this.sidebarServiceSubscribe = this.sideBarService.subscribeTosideBarSubject().subscribe((result)=>{
                  if(result === 'reload'){
                      this.loadSidebarKeyboardNames();
                  }
                });
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
                        this.router.navigate(['/pages/editor-teclado'], { queryParams: { target: result.item.target } });
                      }
            });  
    });
  }

  ngOnDestroy() {
    if(this.loadKeyboardsNamesSubscription) this.loadKeyboardsNamesSubscription.unsubscribe();
    this.sidebarServiceSubscribe.unsubscribe();
  }

  ngOnInit() {

    this.loadSidebarKeyboardNames();
  }

  private loadSidebarKeyboardNames(){
    let user = this.authService.getLocalUser();
    if(this.loadKeyboardsNamesSubscription) this.loadKeyboardsNamesSubscription.unsubscribe();
    this.loadKeyboardsNamesSubscription = this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
        this.menu = this.generateMenuItem(result);
    });
  }



  
  private generateMenuItem(list: KeyboardNamesList){
    let data = list.KeyboardsNames;
    this.jsonArray = [];
    for(let j=0; j < data.length; j++){
      if(data[j] === 'caps') continue;
      let object = {
        title: (j+1).toString() + ' :  ' + data[j],
        target: data[j]
      } 
      this.jsonArray.push(object);
    }
    
    let myJson = [{
        title: this.messageService.getTranslation('SIDEBAR_ITEM_TECLADO'),
        icon: 'nb-home', 
        target: 'hello',
        link: '/pages/editor-teclado', 
        home: true,
        children: this.jsonArray
      },
      {
        title: this.messageService.getTranslation('SIDEBAR_ITEM_STORE'),
        icon: 'ion-ios-cart-outline', 
        target: 'loja',
        link: '/pages/store', 
      },
      {
        title: this.messageService.getTranslation('SIDEBAR_ITEM_CONFIGURACAO'),
        icon: 'nb-gear',
        target: 'config',
        children: [
          {
            title: this.messageService.getTranslation('SIDEBAR_SUBITEM_CONFIG_GERAL'),
            icon: 'nb-grid-a',
            link: '/pages/general-config', 
          },
          {
            title: this.messageService.getTranslation('SIDEBAR_SUBITEM_CONFIG_LAYOUT'),
            icon: 'nb-keypad',
            link: '/pages/layout-editor',
          },
        ]
      }];

     return myJson; 
  };
}