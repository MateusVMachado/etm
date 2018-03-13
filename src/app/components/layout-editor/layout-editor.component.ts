import { AuthService } from '../shared/services/auth.services';
import { Component, OnInit, ViewChild, OnDestroy, Injector} from '@angular/core';
import { Router } from '@angular/router';
import { TecladoComponent } from '../teclado/teclado.component';
import { TecladoModel } from '../teclado/teclado.model';
import { TecladoService } from '../teclado/teclado.service';
import { DragulaService } from 'ng2-dragula';
import { OpenFACLayout, LayoutLine, LayoutButton } from './layout.model';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { HttpClient } from '@angular/common/http';
import { LayoutEditorService } from './layout-editor.service';
import { SideBarService } from '../sidebar/sidebar.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';
import { DeleteLayoutModalComponent } from './delete-layout/delete-layout-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.css']
})


export class LayoutEditorComponent extends AppBaseComponent implements OnInit, OnDestroy {
    
    public masterKeys: TecladoModel = new TecladoModel(); 
    public teclado: TecladoModel = new TecladoModel();
    public tecladoReplicant: TecladoModel = new TecladoModel();
    public finalKeyboardCopy: TecladoModel = new TecladoModel();
    private correctChoices: any;
    public matrixIndex: string;
    public spillMode: boolean = false;
    public timerId: any;

    public aux: string;
    private email: string;

    private keyboardName: string;
    private layoutEditorServiceSubscribe: Subscription;

    constructor(private router: Router, 
                private tecladoService: TecladoService, 
                private dragulaService: DragulaService,
                private authService: AuthService,
                private injector: Injector,
                private http: HttpClient,
                private layoutEditorService: LayoutEditorService,
                private sidebarService: SideBarService,
                private modalService: NgbModal) {
      super(injector);

      dragulaService.setOptions('master-bag', {
        accepts: function (el, target, source, sibling) {
          return target.id === 'content';
        },
        copy: function (el, source) {
          let sourceParts = source.id.split('$');
          let theSource = sourceParts[0];
          return theSource === 'copy';
        },
        removeOnSpill: function (el, source) {
          return source.id === 'content';
        },  
      });


      dragulaService.over.subscribe((value)=> {
        this.onOver(value);
      })

      dragulaService.drag.subscribe((value) => {
        this.onDrag(value);
    });

      dragulaService.drop.subscribe((value) => {
          this.onDrop(value);
      });

      this.createEmptyKeyboard();
      
    }


    ngOnDestroy() {
      this.dragulaService.destroy('master-bag'); 
    }

    ngOnInit() {

      
    }


    public setTimeToDisappear(value){

    }

    public clearTip(value){

    }

    public setCopyMode(value){
      console.log(value[2].var);
    }

    public setKeyboardState(value){


      let newTitle = value[2].className.split('@');
      let title = newTitle[1];

      let parts = title.split("#");
      let x = <number>parts[0];
      let y = <number>parts[1];
      this.tecladoReplicant.teclas[y][x] = "";

    }


    public onMouseOverMaster(){

    }

    public onMouseLeaveMaster(){

    }

    private onOver(value) {

      this.setTimeToDisappear(value);
    } 

    private onDrag(value) {
      let valueParts = value[2].id.split('$');
      let theValue = valueParts[0];
      if(theValue === 'copy') this.setCopyMode(value);
      if(theValue === 'content') this.setKeyboardState(value);


    }    

    private onDrop(value) {
      if (value[2] == null) {//dragged outside any of the bags

          return;
      }    
          let newTitle = value[2].className.split('@');
          let title = newTitle[1];


          let parts = title.split("#");

          let x = <number>parts[0];
          let y = <number>parts[1];


         
          value[1].className = "tamanho-button-especial-full";


          if(this.tecladoReplicant.teclas[y][x] === "") this.tecladoReplicant.teclas[y][x] = value[1].value ;



    }    

    public showModal(component){
        const activeModal = this.modalService.open(component, {size: 'lg', container: 'nb-layout'});
    }

    public sayHello(mystring: string){
  
    }

    public populateLayout(replicant: TecladoModel, email: string): OpenFACLayout{
      let openFacLayout = new OpenFACLayout(); 
      openFacLayout.nameLayout = replicant.type;
      openFacLayout.email = email; 

      let teclado = replicant; // FAZER ATRIBUIÇÃO DO TECLADO QUE ESTÀ SENDO GERADO
      let qntyLines = teclado.teclas.length;

      openFacLayout.Lines = new Array<LayoutLine>();
      for(let i = 0; i < qntyLines; i++){
          openFacLayout.Lines.push(new LayoutLine());
          openFacLayout.Lines[i].Buttons = new Array<LayoutButton>();
          for( let j = 0 ; j < teclado.teclas[i].length; j++){
                  openFacLayout.Lines[i].Buttons.push(new LayoutButton());
                  openFacLayout.Lines[i].Buttons[j].Action = 'Keyboard';
                  openFacLayout.Lines[i].Buttons[j].Caption = 'caption';
                  openFacLayout.Lines[i].Buttons[j].Text = teclado.teclas[i][j]; 
          }
      } 

      return openFacLayout;
   }

   public deleteKeyboardLayout(){
    this.showModal(DeleteLayoutModalComponent);
   }


   public saveKeyboardLayout(){
      // LOAD LAYOUT CONFIGURATION OBJECT
      let totalLines = 0;
      let finalKeyboard = new TecladoModel;
      finalKeyboard.teclas = [];


      this.tecladoReplicant.teclas.forEach(lines => {
        let tam = 0;
        let line = new Array();
        line = [];
          lines.forEach(tecla => {
            if(tecla!=="") {
              line.push(tecla);
              tam += 1;
            }  
          });
        
        if(tam > 0) {
            finalKeyboard.teclas.push(line);  
            totalLines += 1;
        }    
      });

      if(totalLines === 0) {
        this.messageService.error("Não é possivel salvar um teclado vazio!");
        return;
      }  



      this.showModal(LayoutModalComponent);
      this.layoutEditorServiceSubscribe = this.layoutEditorService.subscribeToLayoutEditorSubject().subscribe((nameArrived)=>{
        if(nameArrived){
          this.keyboardName = nameArrived;
        

          let user = this.authService.getLocalUser();
          finalKeyboard.type = this.keyboardName;
          let layout = this.populateLayout(finalKeyboard, user.email);
          
          this.layoutEditorService.saveNewKeyboard(layout, user.email).subscribe((result)=>{
 
            if(result === 'saved'){
     
              this.messageService.success("Layout Salvo! Todas as linhas e colunas em branco foram suprimidas.");
              this.sidebarService.emitSideBarCommand('reload');
            } else if (result === 'alreadyExist'){
              this.messageService.error("Esse nome de teclado já existe.");
            } else if (result === 'maxNumber'){
              this.messageService.error("O máximo de teclados por usuários é 8, por favor delete algum existente para inserir um novo.");
            }  
          });
          this.layoutEditorServiceSubscribe.unsubscribe();
        }
      });


   }

    private createEmptyKeyboard(){
     
      for (let i = 0; i < 5; i++) {
        this.teclado.teclas[i] = [[]];
        this.tecladoReplicant.teclas[i] = [[]];
         let line = new Array();
         let lineReplicant = new Array();
         line = [];
         lineReplicant = [];
          for (let j = 0; j < 14; j++) {
              line[j] = "";
              lineReplicant[j] = "";
          }

          this.teclado.teclas[i] = line;
          this.tecladoReplicant.teclas[i] = lineReplicant;  
      }  
      

      var row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
      var pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
      var sRow: string[] = ['*cpslck', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn', 'PULA'];
      var tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\'', '*arrowleft', '*arrowright', '*arrowup'];
      var zRow: string[] = ['*arrowdown', '*space'];

       this.masterKeys.teclas.push(row);
       this.masterKeys.teclas.push(pRow);
       this.masterKeys.teclas.push(sRow);
       this.masterKeys.teclas.push(tRow);
       this.masterKeys.teclas.push(zRow); 


    }

    private addLine(){
        let line = new Array();
        for (let j = 0; j < 14; j++) {
            line.push('');
        }
        this.teclado.teclas.push(line);  
    }  
    
    private removeLine(){
      this.teclado.teclas.pop();  
    }  

}
