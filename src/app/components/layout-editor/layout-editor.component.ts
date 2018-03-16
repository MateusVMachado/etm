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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';
import { DeleteLayoutModalComponent } from './delete-layout/delete-layout-modal.component';
import { Subscription } from 'rxjs';
import { KeyboardNamesList } from '../sidebar/keyboards-list.model';

import * as $ from 'jquery';

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
      this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
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


      dragulaService.over.subscribe((value)=> {
        this.onOver(value);
      })

      dragulaService.drag.subscribe((value) => {
        //this.onDrag(value);
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

      let self = this;

      $('#newKeyboard').on('click', function(){
        $("[id=content]").each(function(index){
          $(this).children().remove();
        })

        for(let i = 0 ; i< self.tecladoReplicant.teclas.length; i++){
            for( let j = 0 ; j < self.tecladoReplicant.teclas[i].length; j++){
               self.tecladoReplicant.teclas[i][j] = "";
            }
        }

        console.log(JSON.stringify(self.tecladoReplicant) );

      });

    }


    public updateReplicant(){
      let replicantFromDatabase = new TecladoModel();

      let user = this.authService.getLocalUser();
      this.tecladoService.loadSingleKeyboard(this.keyboardToEdit, user.email).subscribe((data)=>{
        
        this.convertLayoutToKeyboard(replicantFromDatabase, data[0]);

     
      console.log("REPLICANT FROM DATABASE");
      console.log(JSON.stringify(replicantFromDatabase) );
   
      var counter = 0;

      var drake = dragula({});


      let totalLength = 0;


      //this.tecladoReplicant.teclas.forEach(element => {
      //  element.forEach(element => {
      //      totalLength += 1;
      //  });
      //});
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

      //for(let i = 0 ; i< self.tecladoReplicant.teclas.length; i++){
      //  for( let j = 0 ; j < self.tecladoReplicant.teclas[i].length; j++){
      //     self.tecladoReplicant.teclas[i][j] = "";
      //  }
      //}

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

      console.log("TECLADO REPLICANT:");
      console.log(JSON.stringify(this.tecladoReplicant) );

      let sEl = $("[id=copy]").clone();
      

      //for(let i = 0; i< totalLength; i++){
         ///////////////////////////////////
        //PARTE NOVA AQUI!!!!!!          //
       ///////////////////////////////////
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

       console.log("COORDINATES MAP:");
       console.log(JSON.stringify(coordinatesMap) );
       console.log("VALUES ARRAY: ");
       console.log(JSON.stringify(valuesArray) );

       console.log("TOTAL LENGHT: " + totalLength);
       for(let i = 0; i< totalLength ; i++){

            if(sEl[i].firstElementChild.tagName === "BUTTON"){
              let index = $.inArray($( $(sEl[i]).find('button')[0] ).val(), valuesArray);
              //let index = valuesArray.indexOf($( $(sEl[i]).find('button')[0] ).val());
              //let index = valuesArray.find(x => x === ($( $(sEl[i]).find('button')[0] ).val()).toString() );
              if(index && index !== -1){
                  let valor = $( $(sEl[i]).find('button')[0] ).val();
                  console.log("VALOR: " + valor);
                  console.log("INDEX: " + index);
                  console.log(valor + " esta na posição: " + index );
                  console.log(JSON.stringify(valuesArray));

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
            
                    

                     let formula = (14*x)+(y);
                      $("[id=content]")[formula].appendChild(el);
                      console.log("INSERIU1");
                      continue;
                    }
                  }                  
              }    
            } else {
              let index = $.inArray($( $(sEl[i]).find('input')[0] ).val(), valuesArray);
              //let index = valuesArray.indexOf($( $(sEl[i]).find('input')[0]).val());
              //let index = valuesArray.find(x => x === ($( $(sEl[i]).find('input')[0] ).val()).toString() );
              if(index && index !== -1){
                  let valor = $( $(sEl[i]).find('input')[0] ).val();
                  console.log("VALOR: " + valor);
                  console.log("INDEX: " + index);   
                  console.log(valor + " esta na posição: " + index );
                  console.log(JSON.stringify(valuesArray));

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
            
                    
                      let formula = (14*x)+(y);
                       $("[id=content]")[formula].appendChild(el1);
                       console.log("INSERIU2");
                       continue;
                    }
                   // console.log(coordinatesMap[cm]);
                  }                    
              }    
            } 
            
          //}
       }
       
       console.log(JSON.stringify( this.tecladoReplicant ) );

      })

    }
  

    
    private loadSingleKeyboardByName(nameLayout: string){

  
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

    public setTimeToDisappear(value){

    }

    public clearTip(value){

    }

    public setCopyMode(value){
  
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
          let drainX, drainY, drainParts, sourceX, sourceY, sourceParts;


          console.log(value);
          console.log("FONTE: " + value[3].className + " ID: " + value[3].id);    
          console.log("RECEPTACULO: " + value[2].className + " ID: " + value[2].id);

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


          console.log("source from : [" + sourceX + ',' + sourceY + '] ');
          console.log("drain to : [" + drainX + ',' + drainY + '] ');
          //console.log(value[3]);


          //return;
          //let newTitle = value[2].className.split('@');
          //let title = newTitle[1];
          //let parts = title.split("#");
          //let x = <number>parts[0];
          //let y = <number>parts[1];

          //if($(value[1]).find('input')[0] !== undefined){
          //  if($(value[1]).find('button')[0]){
          //        console.log("MARK1");
          //        $(value[1]).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
          //        console.log( $(value[2]).find("div")[0].className );
          //        if($(value[2]).children().length > 1 && $(value[2]).find("div")[0].className !== 'none') value[1].remove();
          //        //if(this.tecladoReplicant.teclas[y][x] === "") this.tecladoReplicant.teclas[y][x] = $(value[1]).find('button').val();
          //        if(this.tecladoReplicant.teclas[drainY][drainX] === "") this.tecladoReplicant.teclas[drainY][drainX] = $(value[3]).find('button').val();
          //        this.tecladoReplicant.teclas[sourceY][sourceX] = "";
          //  } else {
          //    console.log("MARK2");
          //        $(value[1]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
          //        console.log( $(value[2]).find("div")[0].className );
          //        if($(value[2]).children().length > 1 && $(value[2]).find("div")[0].className !== 'none') value[1].remove();
          //        //if(this.tecladoReplicant.teclas[y][x] === "") this.tecladoReplicant.teclas[y][x] = $(value[1]).find('input').val();
          //        if(this.tecladoReplicant.teclas[drainY][drainX] === "") this.tecladoReplicant.teclas[drainY][drainX] = $(value[3]).find('input').val();
          //        this.tecladoReplicant.teclas[sourceY][sourceX] = "";
          //  } 

          //} else {
                console.log("MARK4");
                console.log(value[2]);

                let trueValue, copyObj, objClass, trueObj, toSource;
                if(value[3].id === "copy"){
                  console.log("COPY!");
                    trueValue = $($(value[3]).find('input')[0]).val();
                    copyObj = $(value[3]).find('input')[0];
                    objClass = $(value[3]).find('input')[0].className;
                    $(value[2]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                    this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                    this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  
                    console.log(trueValue);
                } else if ( value[3].id === "content"){
                    console.log("CONTENT!");
                    trueValue = $($(value[2]).find('input')[0]).val();
                    copyObj = $(value[2]).find('input')[0];
                    objClass = $(value[2]).find('input')[0].className;
                    //$(value[3]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                    this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                    this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  
                    //toSource = false;
                    console.log(trueValue);
                }    


                objClass = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                
                //if($(trueObj).children().length > 1 && $(trueObj).find("div")[0].className !== 'none') value[trueObj].remove();
                console.log("source from : [" + sourceX + ',' + sourceY + '] ');
                console.log("drain to : [" + drainX + ',' + drainY + '] ');
                
                  //console.log(value[2]);
                  //let buttonParts = value[2].className.split(' ');
                  //console.log(buttonParts);
                  //let coordinates = buttonParts[1].split('@')[1].split('#');
                  //let x = coordinates[0];
                  //let y = coordinates[1];
                  //console.log("COORDINATES: " + coordinates);
                  //console.log($(value[2]).find('button')[0].className);
                  let members; //$(value[2]).find('button')[0].className.split(' ');
                  //console.log(members.length);
                  //if(members[members.length-1] === "gu-transit") {
                  //if(false){  
                  //    $(value[2]).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                      //if(this.tecladoReplicant.teclas[y][x] === "") this.tecladoReplicant.teclas[y][x] = $( $(value[2]).find('button')[0] ).val();
                  //    if(this.tecladoReplicant.teclas[drainY][drainX] === "") this.tecladoReplicant.teclas[drainY][drainX] = $( $(value[2]).find('input')[0] ).val();
                  //    this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                  //} else {
                    //if(this.tecladoReplicant.teclas[y][x] === "") this.tecladoReplicant.teclas[y][x] = $( $(value[1]).find('button')[0] ).val();
                    console.log("TRUE VALUE: " + trueValue);

                    //if(this.tecladoReplicant.teclas[drainY][drainX] === "") 
                    //if(!toSource){
                      //this.tecladoReplicant.teclas[drainY][drainX] = "";
                      //this.tecladoReplicant.teclas[sourceY][sourceX] = trueValue;  
                    //} else {
                    //  this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                    //  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                   // }
                    
                  //}    
                  
                  //if(this.tecladoReplicant.teclas[y][x] === "") this.tecladoReplicant.teclas[y][x] = $( $(value[1]).find('button')[0] ).val();
                  
                  
                //}  else {
                //  console.log("MARK5");
                //    value[1].className = "tamanho-button-especial-full";
                //    if($(value[2]).children().length > 1 && this.tecladoReplicant.teclas[drainY][drainX] !== '') value[1].remove();
                //    if(this.tecladoReplicant.teclas[drainY][drainX] === "") this.tecladoReplicant.teclas[drainY][drainX] = value[3].value;
                //    this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                //}    
         //}

          console.log(JSON.stringify(this.tecladoReplicant) );

    }    

    public showModal(component){
        const activeModal = this.modalService.open(component, {size: 'lg', container: 'nb-layout'});
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
