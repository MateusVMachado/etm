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
import { CaptionTextModalComponent } from './caption-text/caption-text-modal.component';

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
    private payloadSubscription: Subscription;

    private globColumnQnty = 14;

    private lastKind: string;

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
      this.reStartBoard();
      

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
               self.tecladoReplicant.text[i][j] = ""; ////////////////////////ADICIONADO RECENTE /////////////////////////////////////
            }
        }


      });

    }


    public reStartBoard(){
      this.newKeyboard = true;
      this.editMode = false;
      $("[id=content]").each(function(index){
        $(this).children().remove();
      })

      this.keyboardToEdit = "";
      for(let i = 0 ; i< this.tecladoReplicant.teclas.length; i++){
          for( let j = 0 ; j < this.tecladoReplicant.teclas[i].length; j++){
            this.tecladoReplicant.teclas[i][j] = "";
            this.tecladoReplicant.text[i][j] = ""; ////////////////////////ADICIONADO RECENTE /////////////////////////////////////
          }
      }

    }

    public updateReplicant(){
      this.newKeyboard = false;
      this.editMode = true;
      let replicantFromDatabase = new TecladoModel();

      let user = this.authService.getLocalUser();
      this.tecladoService.loadSingleKeyboard(this.keyboardToEdit, user.email, user.jwt).subscribe((data)=>{
        
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
          this.tecladoReplicant.text[i][j] = ""; ////////////////////////ADICIONADO RECENTE /////////////////////////////////////
        }
      }

      for(let i = 0 ; i< replicantFromDatabase.teclas.length; i++){
        for( let j = 0 ; j < replicantFromDatabase.teclas[i].length; j++){
          this.tecladoReplicant.teclas[i][j] = replicantFromDatabase.teclas[i][j];
          this.tecladoReplicant.text[i][j] = replicantFromDatabase.text[i][j]; ////////////////////////ADICIONADO RECENTE /////////////////////////////////////
        }
      }



      let sEl = $("[id=copy]").clone();
      let sElArray = new Array();
      for(let i = 0; i< totalLength ; i++){
        if($(sEl[i]).find('button')[0]){
          sElArray.push($( $(sEl[i]).find('button')[0] ).val()); 
        } else if($(sEl[i]).find('input')[0]){
          sElArray.push($( $(sEl[i]).find('input')[0] ).val()); 
        } 
      }

      let notFoundArray = new Array();

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


       console.log(JSON.stringify(coordinatesMap) );
       for(let i = 0; i< totalLength ; i++){
        let ok = false;
            if(sEl[i].firstElementChild.tagName === "BUTTON"){
              let index = $.inArray($( $(sEl[i]).find('button')[0] ).val(), valuesArray);

              if(index && index !== -1){
                  let valor = $( $(sEl[i]).find('button')[0] ).val();
  
                  
                  for(let cm = 0; cm < coordinatesMap.length; cm++ ){
                    if(coordinatesMap[cm][0] === valor){
                      ok = true;
                      let x = coordinatesMap[cm][1];
                      let y = coordinatesMap[cm][2];
                      this.tecladoReplicant.teclas[x][y] = valor;
                      this.tecladoReplicant.text[x][y] = valor; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                      
                      let el = sEl[i].cloneNode(true);
        
                      if(!$(el).find('input')[0]){
        
                        //$(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                        $(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';

                    
                        
                      }  else {
                        
                        //$(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                        $(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                     

                      }
            
                        $(el).removeAttr('tooltip');
                    

                     let formula = (this.globColumnQnty*x)+(y);
                      $("[id=content]")[formula].appendChild(el);

                      continue;
                    } 
                    if(!ok){
                      let found = false;
                      for(let i = 0; i < notFoundArray.length; i++ ){
                        console.log(notFoundArray[i][0]);

                        if(coordinatesMap[cm][0] === notFoundArray[i][0]){
                            found = true;  
                            break;
                        }    
                      }

                      let index2 = $.inArray(coordinatesMap[cm][0], sElArray);

                        if(!found && index2 === -1 ){ 
                        let map = new Array();
                        map.push(coordinatesMap[cm][0]);
                        map.push(cm);

                        notFoundArray.push(map);
                      }  
                    }


                  }

              }    
            } else {
              let index = $.inArray($( $(sEl[i]).find('input')[0] ).val(), valuesArray);

              if(index && index !== -1){
                  let valor = $( $(sEl[i]).find('input')[0] ).val();

                  let ok = false;

                  for(let cm = 0; cm < coordinatesMap.length; cm++ ){
                    if(coordinatesMap[cm][0] === valor){
                      ok = true;
                      let x = coordinatesMap[cm][1];
                      let y = coordinatesMap[cm][2];
                      this.tecladoReplicant.teclas[x][y] = valor;
                      this.tecladoReplicant.text[x][y] = valor; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////

                      let el1 = sEl[i].cloneNode(true);
        
                      if(!$(el1).find('input')[0]){
        
                        //$(el1).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                        $(el1).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                        
                        
                      }  else {
                        
                        //$(el1).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                        $(el1).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                        

                      }
            
                      $(el1).removeAttr('tooltip');

                      let formula = (this.globColumnQnty*x)+(y);
                       $("[id=content]")[formula].appendChild(el1);
                     
                       continue;

                    } 

                    if(!ok){
                      let found = false;
                      for(let i = 0; i < notFoundArray.length; i++ ){
                        console.log(notFoundArray[i][0]);
                        if(coordinatesMap[cm][0] === notFoundArray[i][0]){
                            found = true;  
                            break;
                        }    
                      }
                      let index2 = $.inArray(coordinatesMap[cm][0], sElArray);
                        if(!found && index2 === -1 ){ 
                        let map = new Array();
                        map.push(coordinatesMap[cm][0]);
                        map.push(cm);

                        notFoundArray.push(map);
                      }  
                    }

                  }                    
              } else {
                  //if(this.tecladoReplicant.teclas[x][y] !== ""){
                  // let x = coordinatesMap[cm][1];
                  //  let y = coordinatesMap[cm][2];
                  //  let formula = (this.globColumnQnty*x)+(y);
                  //}
                  
              } 

            } 



       }

       console.log("SUB1");
       if(notFoundArray.length > 0 ){
         for(let i = 0; i< notFoundArray.length; i++){
            let el3 = sEl[0].cloneNode(true);
            let x = coordinatesMap[notFoundArray[i][1]][1];
            let y = coordinatesMap[notFoundArray[i][1]][2];
            
            console.log(x + "#" + y);
            
            if(!$(el3).find('input')[0]){
              $(el3).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
              $($(el3).find('button')[0]).attr('value', coordinatesMap[notFoundArray[i][1]][0] );
            }  else {
              $(el3).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
              $($(el3).find('input')[0]).attr('value', coordinatesMap[notFoundArray[i][1]][0] );
            }
            $(el3).removeAttr('tooltip');
            let formula = (this.globColumnQnty*x)+(y);
             $("[id=content]")[formula].appendChild(el3);
         }
       }
       //this.tecladoReplicant.teclas[i][j] = 
       //this.tecladoReplicant.text[i][j] = 

       console.log("NOT FOUND ARRAY: ");
       console.log(JSON.stringify(notFoundArray));
       console.log(JSON.stringify(this.tecladoReplicant));


      })

    }
  


    private convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){
      if(!layout) return;
      keyboard.teclas = [];
      keyboard.text = []; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////

      for(let i = 0; i < layout.Lines.length; i++){ ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        let line = []; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        let textL = []; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        for(let j = 0; j < layout.Lines[i].Buttons.length; j++){ ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
          line.push(layout.Lines[i].Buttons[j].Caption); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
          textL.push(layout.Lines[i].Buttons[j].Text); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        } ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        keyboard.teclas.push(line); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        keyboard.text.push(textL); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
      } ////////////////////////ADICIONADO RECENTE ////////////////////////////////////

      keyboard.type = layout.nameLayout

      //layout.Lines.forEach(element => {
      //    let line = [];
      //    element.Buttons.forEach(element => {
      //        line.push(element.Text);
      //    });
      //    keyboard.teclas.push(line);
      //    keyboard.text.push(line);
      //    
      //});
      //keyboard.type = layout.nameLayout;
    
    }


    public setKeyboardState(value){


      let newTitle = value[2].className.split('@');
      let title = newTitle[1];

      let parts = title.split("#");
      let x = <number>parts[0];
      let y = <number>parts[1];
      this.tecladoReplicant.teclas[y][x] = "";
      this.tecladoReplicant.text[y][x] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////

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
      this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
      
    }  

    private onDrop(value) {
      console.clear();
      console.log("ON DROP");
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

                if($(value).find('button')){
                  
                  this.lastKind = $(value[1])[0].id ; 
                  trueValue = $($(value[1])[0]).val() ;
                  
                  if(!this.editMode){
                          if($(value[2]).children().length > 2 ) {   
                            console.log("MARK1");
                            value[1].remove();  
                            trueValue = $($(value[1])[0]).val() ;
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                          } else {
                            trueValue = $($(value[1])[0]).val() ;
                            console.log("MARK2");
                            
                            //this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            //this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                            //this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                            //this.tecladoReplicant.teclas[sourceY][sourceX] = "";

                            if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){ 
                              this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";

                                this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                            } else {
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;

                                this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                            }    
                            
                          } 
                          $(value[1])[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                  } else {
                          if($(value[2]).children().length > 1 ) {   
                            console.log("MARK3");
                            value[1].remove();  
                            trueValue = $($(value[1])[0]).val() ;
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                          } else {
                            console.log("MARK4");

                            if($(value[1]).find('input')[0]){
                              trueValue = $($(value[1]).find('input')[0]).val();
                            } else if($(value[1]).find('button')[0]){
                              trueValue = $($(value[1]).find('button')[0]).val();
                            }

   
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  


                            if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                                this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                            } else {
                                this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                            }  
                            //this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                            //this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////

       
                          } 
                          
                          $(value[1])[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                          if($($(value[1])[0]).find('input')[0]) 
                                  $($(value[1])[0]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                          console.log($(value[1])[0].className);
                  }   
   
                  console.log(JSON.stringify(this.tecladoReplicant));

                  return;
                }

                if(value[3].id === "copy"){
                  
                  this.lastKind = value[3].id ; 


                  console.log("MARK5");
                    trueValue = $($(value[3]).find('input')[0]).val();
                    copyObj = $(value[3]).find('input')[0];
                    objClass = $(value[3]).find('input')[0].className;
                    $(value[2]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                    
                    if($(value[2]).children().length > 2 ) {   
                      console.log("MARK6");
                        value[1].remove();  
                        trueValue = $($(value[1])[0]).val();
                        this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                        this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                    } else {
                      console.log("MARK7");
                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                      this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                      

                      if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                          this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                          this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                      } else {
                          this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                          this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                      }  
                      //this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                      //this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                    } 
                    
                } else if ( value[3].id === "content"){

                  this.lastKind = value[3].id ; 
                  
                  console.log("MARK8");
                    trueValue = $($(value[1])[0]).val();
                    copyObj = $(value[1])[0];
                    objClass = $(value[1])[0].className;

                    if($(value[2]).children().length > 2) { 
                      console.log("MARK9");
                      value[1].remove();  
                      trueValue = $($(value[1])[0]).val();
                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                      this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                    } else {

                      trueValue = $( $(value[1]).children()[0] ).val();
                      if($(value[2]).children().length > 2  ) { 
                        console.log("MARK10");
                          value[1].remove();
                          this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                          this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                          
                          if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                              this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                          } else {
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                          }  
                          //this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                          //this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                      } else {
        
                        if( $(value[1]).find('input')[0]) {
                          console.log("MARK11");
                          trueValue = $($($(value[1])[0]).find('input')[0]).val();
                          if(this.editMode){
                            if($(value[2]).children().length > 1) {
                              console.log("MARK12");
                                value[1].remove();
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                            } else {
                              console.log("MARK13");
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                              

                              if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              } else {
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              }  
                              //this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              //this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                            }    
                          } else {
                            if($(value[2]).children().length > 2) {
                              console.log("MARK14");
                              value[1].remove();
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                            } else {
                              console.log("MARK15");
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  


                              if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              } else {
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              }  
                              //this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              //this.tecladoReplicant.text[drainY][drainX] = trueValue;  ////////////////////////ADICIONADO RECENTE //////////////////////////////////// 
                            } 
                          }  
  
                        } else {

                          trueValue = $($(value[1])[0]).val();
                            if(this.editMode){
                              if($(value[2]).children().length > 1) {
                                console.log("MARK16");
                                  value[1].remove();
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              } else {
                                console.log("MARK17");
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                                

                                if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                } else {
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                }  
                                //this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                //this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              }    
                            } else {
                              if($(value[2]).children().length > 2) {
                                console.log("MARK18");
                                  value[1].remove();
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              } else {
                                console.log("MARK19");
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  


                                if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                } else {
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                }  
                                //this.tecladoReplicant.text[sourceY][sourceX] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                                //this.tecladoReplicant.text[drainY][drainX] = trueValue; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
                              }   
                            }  

                        }   
                      } 
                    } 

                }    


                objClass = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
       
                console.log(JSON.stringify(this.tecladoReplicant));
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
                  openFacLayout.Lines[i].Buttons[j].Caption = teclado.teclas[i][j]; 
                  openFacLayout.Lines[i].Buttons[j].Text = teclado.text[i][j]; 
                  //openFacLayout.Lines[i].Buttons[j].Text = teclado.teclas[i][j]; 
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
              this.messageService.error("Não é possivel sobrescrever um teclado do sistema!\nPor favor, utilize a opção \"Salvar Como\"");
              return;
            }
      }      
      // LOAD LAYOUT CONFIGURATION OBJECT
      let totalLines = 0;
      let finalKeyboard = new TecladoModel;
      finalKeyboard.teclas = [];
      finalKeyboard.text = []; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////


      for(let i = 0; i< this.tecladoReplicant.teclas.length; i++){ ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        let tam = 0; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        let teclasLine = new Array(); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        let textLine = new Array(); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        teclasLine = []; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        textLine = []; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        for(let j=0; j < this.tecladoReplicant.teclas[i].length; j++){ ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
           if(this.tecladoReplicant.teclas[i][j] !== "" && this.tecladoReplicant.teclas[i][j] !== " "){ ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
             teclasLine.push(this.tecladoReplicant.teclas[i][j]); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
             textLine.push(this.tecladoReplicant.text[i][j]); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
             tam += 1; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
           } ////////////////////////ADICIONADO RECENTE ////////////////////////////////////

        }////////////////////////ADICIONADO RECENTE ////////////////////////////////////

        if(tam > 0) { ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
          finalKeyboard.teclas.push(teclasLine);  ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
          finalKeyboard.text.push(textLine);////////////////////////ADICIONADO RECENTE ////////////////////////////////////
          totalLines += 1;////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        }    ////////////////////////ADICIONADO RECENTE ////////////////////////////////////

      }////////////////////////ADICIONADO RECENTE ////////////////////////////////////


      /*
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
      */


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
        this.teclado.text[i] = [[]]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        this.tecladoReplicant.teclas[i] = [[]];
        this.tecladoReplicant.text[i] = [[]]; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
         let line = new Array();
         let textL = new Array(); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
         let lineReplicant = new Array();
         let textReplicant = new Array(); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
         line = [];
         textL = []; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
         lineReplicant = [];
         textReplicant = []; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
          for (let j = 0; j < 14; j++) {
              line[j] = "";
              textL[j] = "";  ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
              lineReplicant[j] = "";
              textReplicant[j] = ""; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////

          }

          this.teclado.teclas[i] = line;
          this.teclado.text[i] = textL; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
          this.tecladoReplicant.teclas[i] = lineReplicant; 
          this.tecladoReplicant.text[i] = textReplicant;  ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
      }  
      

      var row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
      var pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
      var sRow: string[] = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn', 'PULA', ''];
      var tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '*arrowleft', '*arrowright', '*arrowup', ''];
      var zRow: string[] = ['*arrowdown', '*space', '', '', '', '', '', '', '', '', '', '', '', ''];

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
        this.teclado.text.push(line); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////  
        this.tecladoReplicant.teclas[this.tecladoReplicant.teclas.length] = lineReplicant;
        this.tecladoReplicant.text[this.tecladoReplicant.text.length] = lineReplicant; ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
        
    }  
    
    private removeLine(){
      if(this.teclado.teclas.length > 5){
          this.teclado.teclas.pop();
          this.teclado.text.pop();  ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
          this.tecladoReplicant.teclas.pop();
          this.tecladoReplicant.text.pop(); ////////////////////////ADICIONADO RECENTE ////////////////////////////////////
      } else {
        this.messageService.error("O mínimo de linhas no modo edição é 5.");
      }   
    }  



    public editCaptionNText(event){
        this.showModal(CaptionTextModalComponent);

        this.payloadSubscription = this.layoutEditorService.subscribeToLayoutEditorPayloadSubject().subscribe((result)=>{

          //$("[id=copy]").each(function(index){
          //  console.log($(this).children()[0].className.split(' ')[0]);
          //})
              let buttonText = "";
              buttonText = result[0];
              let buttonCaption = "";
              buttonCaption = result[1];

              if(buttonText === undefined) buttonText = " ";
              if(buttonCaption === undefined) buttonCaption = " ";

              console.log(event.target.className);
              
              let parts = event.target.className.split(' ');
              //$.inArray($( $(sEl[i]).find('button')[0] ).val(), valuesArray);
              console.log(parts[1].indexOf('#'));
      
              if(parts[0].indexOf('#') !== -1){
                console.log("BRANCA");
                let x = <number>parts[0].split('#')[0];
                let y = <number>parts[0].split('#')[1];
                
                console.log(event.target.className);
                console.log(x + ' - ' + y);
                
                let formula = this.globColumnQnty*Number(y)+Number(x);
                console.log("FORMULA: " + formula);
                let sEl = $("[id=copy]").clone();

                //let el;
                //if(formula >= sEl.length){
                  //el = sEl[0].cloneNode(true);
                //} else {
                let el = sEl[<number>formula].cloneNode(true);
                //}
                console.log(sEl.length);
                
                
                console.log(el);
                if($(el).find('input')[0]){
                  console.log("MARK-ALPHA");
                  $(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                  $($(el).find('input')[0]).attr('value', buttonCaption);
                } else if($(el).find('button')[0]){
                  console.log("MARK-OMEGA");
                  $(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                  
                  if($($(el).find('button')[0]).find('mat-icon')[0]) $($(el).find('button')[0]).find('mat-icon')[0].remove();
                  $($(el).find('button')[0]).text(buttonCaption);
                  $($(el).find('button')[0]).attr('value', buttonCaption);
                  
                }
                

                
                this.tecladoReplicant.teclas[y][x] = buttonCaption;
                this.tecladoReplicant.text[y][x] = buttonText;

                $(el).removeAttr('tooltip');
                
               
                $("[id=content]")[formula].appendChild(el);
                console.log(JSON.stringify(this.tecladoReplicant));

              } else {
                console.clear();



                console.log("AZUL");

                console.log(event.target);
                let x = parts[1].split('#')[0];
                let y = parts[1].split('#')[1];


                console.log("TECLA: " + $($(event.target)[0]).val().toString())
                let tecla = $($(event.target)[0]).val().toString();
                console.log("TECLA DEPOIS: " + $($(event.target)[0]).val().toString())
                if(tecla === '*bckspc' || tecla === '*tab' || tecla === '*kbdrtrn' || tecla === 'PULA'
                    || tecla === '*arrowleft' || tecla === '*arrowright' || tecla === '*arrowup'
                    || tecla === '*arrowdown' || tecla === '*space' || tecla === "" ) {
                  console.log("TECLA ESPECIAL");
                  this.messageService.error("Não é possível alterar teclas especiais.");
                  this.payloadSubscription.unsubscribe();
                  return;
                }
              

                console.log(event.target);
                $($(event.target)[0]).attr('value', buttonCaption);
                //this.tecladoReplicant.teclas[y][x] = buttonCaption;
                //this.tecladoReplicant.text[y][x] = buttonText;
                this.tecladoReplicant.teclas[y][x] = buttonCaption;
                this.tecladoReplicant.text[y][x] = buttonText;


                //console.log($(event.target)[0]);
                
               
                //console.log("RESULT: " + buttonCaption + ' ' + buttonText);


                //console.log( event.target.id);

                /*
                if(!this.editMode){
                  console.log("ALPHA");
                  this.tecladoReplicant.teclas[y][x] = buttonCaption;
                  this.tecladoReplicant.text[y][x] = buttonText;
                } else {
                  console.log("ÔMEGA");
                  this.tecladoReplicant.teclas[y][x] = buttonCaption;
                  this.tecladoReplicant.text[y][x] = buttonText;
                }
                */

                // TECLAS ARRASTADAS E EDITADAS SALVAM DA SEGUINTE FORMA
                //this.tecladoReplicant.teclas[y][x] = buttonCaption;
                //this.tecladoReplicant.text[y][x] = buttonText;


                console.log(JSON.stringify(this.tecladoReplicant));

              }
              console.log(event.target.className);
              this.payloadSubscription.unsubscribe();
        })


      }
      
}
