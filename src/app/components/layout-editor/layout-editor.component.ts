import { AuthService } from '../shared/services/auth.services';
import { Component, OnInit, ViewChild, OnDestroy, Injector} from '@angular/core';
import { Router } from '@angular/router';
import { TecladoComponent } from '../teclado/teclado.component';
import { TecladoModel } from '../teclado/teclado.model';
import { TecladoService } from '../teclado/teclado.service';
import { DragulaService, dragula } from 'ng2-dragula';
import { OpenFACLayout, LayoutLine, LayoutButton } from './layout.model';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { HttpClient } from '@angular/common/http';
import { LayoutEditorService } from './layout-editor.service';
import { SideBarService } from '../sidebar/sidebar.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';
import { DeleteLayoutModalComponent } from './delete-layout/delete-layout-modal.component';
import { Subscription } from 'rxjs';
import { KeyboardNamesList } from '../sidebar/keyboards-list.model';

import * as $ from 'jquery';
import { SaveModalComponent } from './save-layout/save-modal.component';

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

    public keyboardToEdit: string;
    public keyboardItems: KeyboardNamesList = new KeyboardNamesList();

    public keyboardItemsToReload: KeyboardNamesList = new KeyboardNamesList();

    private editMode: boolean = false;
    private newKeyboard: boolean = true;

    private layoutEditorServiceSubscribe2: Subscription;
    private modal: NgbModalRef;
    private keyboardNamesSubscribe: Subscription;

    constructor(private router: Router, 
                private tecladoService: TecladoService, 
                private dragulaService: DragulaService,
                private authService: AuthService,
                private injector: Injector,
                private http: HttpClient,
                private layoutEditorService: LayoutEditorService,
                private sidebarService: SideBarService,
                private modalService: NgbModal,
                private sideBarService: SideBarService) {
      super(injector);

      let user = this.authService.getLocalUser();
      this.keyboardNamesSubscribe = this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
          this.keyboardItems = result;
      });

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


      dragulaService.remove.subscribe((value)=> {
        this.onRemove(value);
      })


      dragulaService.drop.subscribe((value) => {
          this.onDrop(value);
      });

      this.createEmptyKeyboard();
      
    }


    ngOnDestroy() {
      this.dragulaService.destroy('master-bag'); 
    }

    ngOnInit() {

      let self = this;

      $('#newKeyboard').on('click', function(){
        self.newKeyboard = true;
        self.editMode = false;
        $("[id=content]").each(function(index){
          $(this).children().remove();
        })

        self.keyboardToEdit = "";
        for(let i = 0 ; i< self.tecladoReplicant.teclas.length; i++){
            for( let j = 0 ; j < self.tecladoReplicant.teclas[i].length; j++){
               self.tecladoReplicant.teclas[i][j] = "";
            }
        }


      });

    }


    public updateReplicant(){
      this.newKeyboard = false;
      this.editMode = true;
      let replicantFromDatabase = new TecladoModel();

      let user = this.authService.getLocalUser();
      this.tecladoService.loadSingleKeyboard(this.keyboardToEdit, user.email).subscribe((data)=>{
        
        this.convertLayoutToKeyboard(replicantFromDatabase, data[0]);

        

      var counter = 0;

      var drake = dragula({});


      let totalLength = 0;


      this.masterKeys.teclas.forEach(element => {
        element.forEach(element => {
            totalLength += 1;
        });
      });


      var elem2;
      elem2 = $("[id=copy]")[1].cloneNode(true);
      
      $("[id=content]").each(function(index){
        $(this).children().remove();
      })


      for(let i = 0 ; i< this.tecladoReplicant.teclas.length; i++){
        for( let j = 0 ; j < this.tecladoReplicant.teclas[i].length; j++){
          this.tecladoReplicant.teclas[i][j] = "";
        }
      }

      for(let i = 0 ; i< replicantFromDatabase.teclas.length; i++){
        for( let j = 0 ; j < replicantFromDatabase.teclas[i].length; j++){
          this.tecladoReplicant.teclas[i][j] = replicantFromDatabase.teclas[i][j];
        }
      }



      let sEl = $("[id=copy]").clone();
      

       let coordinatesMap = new Array();
       let valuesArray = new Array();
       valuesArray.push("");
       for(let j = 0 ; j< this.tecladoReplicant.teclas.length; j++){
          for( let k = 0 ; k < this.tecladoReplicant.teclas[j].length; k++){
             if(this.tecladoReplicant.teclas[j][k] !== "") {
               let map = new Array();
               map.push(this.tecladoReplicant.teclas[j][k]);
               map.push(j);
               map.push(k);
               coordinatesMap.push(map);
               valuesArray.push(this.tecladoReplicant.teclas[j][k]);
             } 
          }
       }     


       for(let i = 0; i< totalLength ; i++){

            if(sEl[i].firstElementChild.tagName === "BUTTON"){
              let index = $.inArray($( $(sEl[i]).find('button')[0] ).val(), valuesArray);

              if(index && index !== -1){
                  let valor = $( $(sEl[i]).find('button')[0] ).val();


                  for(let cm = 0; cm < coordinatesMap.length; cm++ ){
                    if(coordinatesMap[cm][0] === valor){
                      let x = coordinatesMap[cm][1];
                      let y = coordinatesMap[cm][2];
                      this.tecladoReplicant.teclas[x][y] = valor;
                      
                      let el = sEl[i].cloneNode(true);
        
                      if(!$(el).find('input')[0]){
        
                        $(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                    
                        
                      }  else {
                        
                        $(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                     

                      }
            
                        $(el).removeAttr('tooltip');
                    

                     let formula = (14*x)+(y);
                      $("[id=content]")[formula].appendChild(el);

                      continue;
                    }
                  }                  
              }    
            } else {
              let index = $.inArray($( $(sEl[i]).find('input')[0] ).val(), valuesArray);

              if(index && index !== -1){
                  let valor = $( $(sEl[i]).find('input')[0] ).val();


                  for(let cm = 0; cm < coordinatesMap.length; cm++ ){
                    if(coordinatesMap[cm][0] === valor){
                      let x = coordinatesMap[cm][1];
                      let y = coordinatesMap[cm][2];
                      this.tecladoReplicant.teclas[x][y] = valor;
                      
                      let el1 = sEl[i].cloneNode(true);
        
                      if(!$(el1).find('input')[0]){
        
                        $(el1).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                        
                        
                      }  else {
                        
                        $(el1).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                        

                      }
            
                      $(el1).removeAttr('tooltip');

                      let formula = (14*x)+(y);
                       $("[id=content]")[formula].appendChild(el1);
                     
                       continue;
                    }

                  }                    
              }    
            } 

       }
       

      })


      
    }
  


    private convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){
      keyboard.teclas = [];
      layout.Lines.forEach(element => {
          let line = [];
          element.Buttons.forEach(element => {
              line.push(element.Text);
          });
          keyboard.teclas.push(line);
          
      });
      keyboard.type = layout.nameLayout;
  }


    public setKeyboardState(value){


      let newTitle = value[2].className.split('@');
      let title = newTitle[1];

      let parts = title.split("#");
      let x = <number>parts[0];
      let y = <number>parts[1];
      this.tecladoReplicant.teclas[y][x] = "";

    }


    private onRemove(value){
        let drainX, drainY, drainParts, sourceX, sourceY, sourceParts;
        if(value[3].id === 'copy'){  
          sourceParts = value[3].className.split('$')[1].split('#');
          sourceX = sourceParts[0];
          sourceY = sourceParts[1];
      } else if ( value[3].id === 'content'){
          sourceParts = value[3].className.split(' ')[0].split('#');
          sourceX = sourceParts[0];
          sourceY = sourceParts[1];
      }   

      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
      
    }  

    private onDrop(value) {
      if (value[2] == null) {//dragged outside any of the bags
          return;
      }    
          let drainX, drainY, drainParts, sourceX, sourceY, sourceParts;


          if(value[3].id === 'copy'){  
              sourceParts = value[3].className.split('$')[1].split('#');
              sourceX = sourceParts[0];
              sourceY = sourceParts[1];
          } else if ( value[3].id === 'content'){
              sourceParts = value[3].className.split(' ')[0].split('#');
              sourceX = sourceParts[0];
              sourceY = sourceParts[1];
          }   

          if(value[2].id === 'content'){
              drainParts = value[2].className.split(' ')[0].split('#');
              drainX = drainParts[0];
              drainY = drainParts[1];
          }    


                let trueValue, copyObj, objClass, trueObj, toSource;
                if(value[3].id === "copy"){
                  
                    trueValue = $($(value[3]).find('input')[0]).val();
                    copyObj = $(value[3]).find('input')[0];
                    objClass = $(value[3]).find('input')[0].className;
                    $(value[2]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                    
                    if($(value[2]).children().length > 2 ) {   
                        value[1].remove();  
                        trueValue = $($(value[1])[0]).val();
                        this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                    } else {
                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                      this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  
                    } 
                    
                } else if ( value[3].id === "content"){
                    trueValue = $($(value[1])[0]).val();
                    copyObj = $(value[1])[0];
                    objClass = $(value[1])[0].className;

                    if($(value[2]).children().length > 2) { 
                      value[1].remove();  
                      trueValue = $($(value[1])[0]).val();
                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                    } else {

                      trueValue = $( $(value[1]).children()[0] ).val();
                      if($(value[2]).children().length > 2  ) { 
                          value[1].remove();
                          this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                          this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  
                      } else {
        
                        if( $(value[1]).find('input')[0]) {
                          trueValue = $($($(value[1])[0]).find('input')[0]).val();
                          if(this.editMode){
                            if($(value[2]).children().length > 1) {
                                value[1].remove();
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            } else {
                              
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  
                            }    
                          } else {
                            if($(value[2]).children().length > 2) {
                              value[1].remove();
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            } else {
                              
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  
                            } 
                          }  
  
                        } else {

                          trueValue = $($(value[1])[0]).val();
                            if(this.editMode){
                              if($(value[2]).children().length > 1) {
                                  value[1].remove();
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              } else {
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  
                              }    
                            } else {
                              if($(value[2]).children().length > 2) {
                                  value[1].remove();
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              } else {
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  
                              }   
                            }  

                        }   
                      } 
                    } 

                }    


                objClass = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';

    }    

    public showModal(component){
        const activeModal = this.modalService.open(component, {size: 'lg', container: 'nb-layout'});
        this.modal = activeModal;
    }

    public closeModal(){
      this.modal.close();
  } 

    public sayHello(mystring: string){
      console.log(this.keyboardToEdit);

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
    

    this.keyboardItems.KeyboardsNames.push(this.keyboardName);
    this.keyboardToEdit = this.keyboardName;
   }


   public saveKeyboardLayout(saveAs: boolean){
     if(!saveAs){
            if(this.keyboardToEdit === 'pt-br'){
              this.messageService.error("Não é possivel sobrescrever um teclado do sistema!");
              return;
            }
      }      
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


      if(saveAs || this.newKeyboard){
              this.showModal(LayoutModalComponent);
              this.layoutEditorServiceSubscribe = this.layoutEditorService.subscribeToLayoutEditorSubject().subscribe((nameArrived)=>{
                if(nameArrived && nameArrived !== 'confirm' && nameArrived !== 'refuse'){
                  this.keyboardName = nameArrived;
                

                  let user = this.authService.getLocalUser();
                  finalKeyboard.type = this.keyboardName;
                  let layout = this.populateLayout(finalKeyboard, user.email);
                  
                  this.layoutEditorService.saveNewKeyboard(layout, user.email).subscribe((result)=>{
        
                    if(result === 'saved'){
            
                      this.messageService.success("Layout Salvo! Todas as linhas e colunas em branco foram suprimidas.");
                      this.sidebarService.emitSideBarCommand('reload');
                    } else if (result === 'alreadyExist'){

                      this.showModal(SaveModalComponent);
                      this.layoutEditorServiceSubscribe2 = this.layoutEditorService.subscribeToLayoutEditorSubject().subscribe((result)=>{
                        if(result === "confirm"){
                               let user = this.authService.getLocalUser();
                               finalKeyboard.type = this.keyboardToEdit;
                              
                               let layout = this.populateLayout(finalKeyboard, user.email);
                               layout.nameLayout = this.keyboardName;

                              
                               this.layoutEditorService.updateOnlyKeyboard(layout, user.email).subscribe((result)=>{
                                 if(result === 'updated'){
                                  
                                   this.messageService.success("Layout Salvo! Todas as linhas e colunas em branco foram suprimidas.");
                                   this.sidebarService.emitSideBarCommand('reload');

                                   this.keyboardItems.KeyboardsNames.push(this.keyboardName);

                                 } else if (result === 'maxNumber'){
                                   this.messageService.error("O máximo de teclados por usuários é 8, por favor delete algum existente para inserir um novo.");
                                 }  
                               });
                               
                               this.layoutEditorServiceSubscribe2.unsubscribe();
                        }
                      })



                    } else if (result === 'maxNumber'){
                      this.messageService.error("O máximo de teclados por usuários é 8, por favor delete algum existente para inserir um novo.");
                    }  
                  });
                  this.layoutEditorServiceSubscribe.unsubscribe();
                }
              });

     } else if(!this.newKeyboard){
     
           this.showModal(SaveModalComponent);
           this.layoutEditorService.subscribeToLayoutEditorSubject().subscribe((result)=>{
             if(result === "confirm"){
                    let user = this.authService.getLocalUser();
                    finalKeyboard.type = this.keyboardToEdit;
                    let layout = this.populateLayout(finalKeyboard, user.email);
                    
                    this.layoutEditorService.updateOnlyKeyboard(layout, user.email).subscribe((result)=>{
        
                      if(result === 'updated'){
        
                        this.messageService.success("Layout Salvo! Todas as linhas e colunas em branco foram suprimidas.");
                        this.sidebarService.emitSideBarCommand('reload');

                        this.keyboardItems.KeyboardsNames.push(this.keyboardName);
             

                      } else if (result === 'maxNumber'){
                        this.messageService.error("O máximo de teclados por usuários é 8, por favor delete algum existente para inserir um novo.");
                      }  
                    });


             }
           })
          

     }

   }

  public reloadList(){

      this.keyboardNamesSubscribe.unsubscribe();
      let user = this.authService.getLocalUser();
      this.keyboardNamesSubscribe = this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
            this.keyboardItems = result;
     
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
      var tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '*arrowleft', '*arrowright', '*arrowup'];
      var zRow: string[] = ['*arrowdown', '*space'];

       this.masterKeys.teclas.push(row);
       this.masterKeys.teclas.push(pRow);
       this.masterKeys.teclas.push(sRow);
       this.masterKeys.teclas.push(tRow);
       this.masterKeys.teclas.push(zRow); 


    }

    private addLine(){
        let line = new Array();
        let lineReplicant = new Array();
        line = [];
        lineReplicant = [];
        for (let j = 0; j < 14; j++) {
            line.push('');
            lineReplicant[j] = '';
        }
        this.teclado.teclas.push(line);  
        this.tecladoReplicant.teclas[this.tecladoReplicant.teclas.length] = lineReplicant;
        
    }  
    
    private removeLine(){
      this.teclado.teclas.pop();  
      this.tecladoReplicant.teclas.pop();
    }  

}
