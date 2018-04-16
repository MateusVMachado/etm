import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';
import * as moment from 'moment';
import { dragula, DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';

import { AppBaseComponent } from '../shared/components/app-base.component';
import { TimeIntervalUnit, UserSessionModel } from '../shared/models/userSession.model';
import { AuthService } from '../shared/services/auth.services';
import { BackLoggerService } from '../shared/services/backLogger.service';
import { KeyboardNamesList } from '../sidebar/keyboards-list.model';
import { SideBarService } from '../sidebar/sidebar.service';
import { TecladoModel } from '../teclado/teclado.model';
import { TecladoService } from '../teclado/teclado.service';
import { CaptionTextModalComponent } from './caption-text/caption-text-modal.component';
import { CaptionTextService } from './caption-text/caption-text.service';
import { DeleteLayoutModalComponent } from './delete-layout/delete-layout-modal.component';
import { LayoutEditorService } from './layout-editor.service';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';
import { LayoutButton, LayoutLine, OpenFACLayout } from './layout.model';
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
    private payloadSubscription: Subscription;

    private globColumnQnty = 14;

    private lastKind: string;
    
    private userSession: UserSessionModel;
    private timeInterval: TimeIntervalUnit;

    public lines: number;
    public imgLinesArray = new Array();
    public imgIsModified = new Array();

    public x: number;
    public y: number;
    public exist: boolean = false;
    public tam:string  = "150px";
    public setButton: boolean = false;

    public minimo:number = 5;
    public dummyArray = ['', '', '', '', ''];

    public count: number = 0;

    private imgMaxHeightSize = 0;
    private imgMaxWidthSize = 0;

    private markedTarget: number = 0;

    private TAMANHO_DE_TESTE: number = 80;
    private keysHeightSize: number = 48;
    private keysWidthSize: number;
    

    private keyboardContainerSize: number;

    constructor(private router: Router, 
                private tecladoService: TecladoService, 
                private dragulaService: DragulaService,
                private authService: AuthService,
                private injector: Injector,
                private http: HttpClient,
                private layoutEditorService: LayoutEditorService,
                private sidebarService: SideBarService,
                private modalService: NgbModal,
                private sideBarService: SideBarService,
                private captionTextService: CaptionTextService,
                private backLoggerService: BackLoggerService) {
      super(injector);       
                  
     

      
      
     
                  
      console.log("TAM INIT: " + this.keysWidthSize);
      
      //this.keysSize = container.width;

      this.userSession = new UserSessionModel();
      this.userSession.layoutEditorIntervals = new Array();
      this.timeInterval = new TimeIntervalUnit();

      this.timeInterval.inTime = moment().format("HH:mm:ss");


      let user = this.authService.getLocalUser();
      this.userSession.user = user.email;            

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
      this.timeInterval.outTime = moment().format('HH:mm:ss');
      this.userSession.layoutEditorIntervals.push(this.timeInterval);
      this.backLoggerService.sendLayoutIntervalNow(this.userSession).subscribe(()=>{   });
      //SEND USER SESSION TO BACKEND 
    }

    ngOnInit() {

      this.keyboardContainerSize = $(document.getElementsByClassName('teclado-container-editor')).width();
      
      //this.keysWidthSize = (this.keyboardContainerSize - (this.globColumnQnty*3.7) )/this.globColumnQnty;
      this.keysWidthSize = (this.keyboardContainerSize - (this.globColumnQnty*5.5) )/this.globColumnQnty;

      let self = this;

      
      $('#newKeyboard').on('click', function(){
        self.newKeyboard = true;
        self.editMode = false;
        
        for(let line = 0; line < self.teclado.teclas.length; line++){
          for(let col = 0; col < self.teclado.teclas[line].length; col ++){
            if(self.tecladoReplicant.teclas[line][col].split('$')[0] === '*img'){
                self.changeLineSize2(line, 'default');  
            }
          }
        }


        $("[id=content]").each(function(index){
          $(this).children().remove();          
        })
      

        self.keyboardToEdit = "";
        for(let i = 0 ; i< self.tecladoReplicant.teclas.length; i++){
            for( let j = 0 ; j < self.tecladoReplicant.teclas[i].length; j++){
               self.tecladoReplicant.teclas[i][j] = "";
               self.tecladoReplicant.text[i][j] = "";
               self.tecladoReplicant.action[i][j] = "";  
               self.tecladoReplicant.image[i][j] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
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
            this.tecladoReplicant.text[i][j] = ""; 
            this.tecladoReplicant.action[i][j] = "";  
            this.tecladoReplicant.image[i][j] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
          }
      }

    }






     //////////////////////////////////////
    // LOAD DO TECLADO VIA COPY DRAGULA //
   ////////////////////////////////////// 


    public updateReplicant(){
      this.newKeyboard = false;
      this.editMode = true;
      let replicantFromDatabase = new TecladoModel();

      let user = this.authService.getLocalUser();
      this.tecladoService.loadSingleKeyboard(this.keyboardToEdit, user.email, user.jwt).subscribe(async (data)=>{
        
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
      

      console.log("ANTES DE LIMPAR:");
      console.log(JSON.stringify(this.teclado.teclas) );
      for(let line = 0; line < this.teclado.teclas.length; line++){
        for(let col = 0; col < this.teclado.teclas[line].length; col ++){
          if(this.tecladoReplicant.teclas[line][col].split('$')[0] === '*img'){
            console.log("*img ENCONTRADO; LINHA: " + line);
              this.changeLineSize2(line, 'default');  
          }
        }
      }

      $("[id=content]").each(function(index){
        $(this).children().remove();
      })


      for(let i = 0 ; i< this.tecladoReplicant.teclas.length; i++){
        for( let j = 0 ; j < this.tecladoReplicant.teclas[i].length; j++){
          this.tecladoReplicant.teclas[i][j] = "";
          this.tecladoReplicant.text[i][j] = "";
          this.tecladoReplicant.action[i][j] = "";  
          this.tecladoReplicant.image[i][j] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        }
      }

      for(let i = 0 ; i< replicantFromDatabase.teclas.length; i++){
        for( let j = 0 ; j < replicantFromDatabase.teclas[i].length; j++){
          this.tecladoReplicant.teclas[i][j] = replicantFromDatabase.teclas[i][j];
          this.tecladoReplicant.text[i][j] = replicantFromDatabase.text[i][j];
          this.tecladoReplicant.action[i][j] = replicantFromDatabase.action[i][j]; 
          this.tecladoReplicant.image[i][j] = replicantFromDatabase.image[i][j];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        }
      }



      let sEl = $("[id=copy]").clone();
      let sElArray = new Array();
      for(let i = 0; i< totalLength ; i++){
        if($(sEl[i]).find('button')[0]){
          sElArray.push($( $(sEl[i]).find('button')[0] ).val().toString().toLowerCase()); 
        } else if($(sEl[i]).find('input')[0]){
          sElArray.push($( $(sEl[i]).find('input')[0] ).val().toString().toLowerCase()); 
        } 
      }


       let notFoundArray = new Array();

       let coordinatesMap = new Array();
       let valuesArray = new Array();
       let valuesArrayLower = new Array();
       valuesArray.push("");
       valuesArrayLower.push("");
       for(let j = 0 ; j< this.tecladoReplicant.teclas.length; j++){
          for( let k = 0 ; k < this.tecladoReplicant.teclas[j].length; k++){
             if(this.tecladoReplicant.teclas[j][k] !== "") {
               let map = new Array();
               map.push(this.tecladoReplicant.teclas[j][k]);
               map.push(j);
               map.push(k);
               coordinatesMap.push(map);
               valuesArray.push(this.tecladoReplicant.teclas[j][k]);
               valuesArrayLower.push(this.tecladoReplicant.teclas[j][k].toString().toLowerCase());
             } 
          }
       }     

       
       let specialKeys = new Array();
       let valor;
       let el1;
       for(let k = 0; k < sEl.length; k++){
            if(!$(sEl[k]).find('input')[0]){
                valor = $($(sEl[k]).find('button')[0]).val();
                let specialMap = new Array();
                specialMap.push(valor);
                specialMap.push(k);
                specialKeys.push(specialMap);
            } else {
              continue;
            }
        }

       for(let cm = 0; cm < coordinatesMap.length; cm++ ){
              let x = coordinatesMap[cm][1];
              let y = coordinatesMap[cm][2];
              this.tecladoReplicant.teclas[x][y] = replicantFromDatabase.teclas[x][y];
              this.tecladoReplicant.text[x][y] = replicantFromDatabase.text[x][y];
              this.tecladoReplicant.action[x][y] = replicantFromDatabase.action[x][y]; 
              this.tecladoReplicant.image[x][y] = replicantFromDatabase.image[x][y];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
              
              if(this.tecladoReplicant.teclas[x][y].substring(0,1) === '*' && this.tecladoReplicant.teclas[x][y].split('$')[0] !== '*img'){////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                for(let j=0; j < specialKeys.length; j++){
                  if(specialKeys[j][0] === this.tecladoReplicant.teclas[x][y] ){
                    el1 = sEl[specialKeys[j][1]].cloneNode(true);
                  }
                }
                
              } else {
                el1 = sEl[0].cloneNode(true);
              }
              
        
                      if(!$(el1).find('input')[0]){
        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] !== '*img') {
                          $($(el1).find('button')[0]).attr('value', replicantFromDatabase.teclas[x][y]);
                          //$(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                          $(el1).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                        }  

                        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] === '*img'){

                          let height = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[0];
                          let width = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[1];
                          this.imgMaxHeightSize = height;
                          this.imgMaxWidthSize = width;

                          this.changeDragulaBackground( $($(el1)), replicantFromDatabase.image[x][y], height, width, 100, 100);
                          $($(el1).find('button')[0]).attr('class', 'tamanho-button-especial-big');
                          $($(el1).find('button')[0]).attr('display', 'none');
                            if(this.checkLineHasImage(x)){
                              this.changeLineSize2(x, 'imgSize');
                            }
                            //this.changeLineSize2(x, 'imgSize');  

                        }
                        
                        
                      }  else {
                        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] !== '*img') {
                            $($(el1).find('input')[0]).attr('value', replicantFromDatabase.teclas[x][y]);
                            //$(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                            $(el1).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                        }    
                        
                
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] === '*img'){

                          let height = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[0];
                          let width = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[1];
                          this.imgMaxHeightSize = height;
                          this.imgMaxWidthSize = width;

                          this.changeDragulaBackground( $(el1), replicantFromDatabase.image[x][y], height, width, 100, 100);
                          $($(el1).find('input')[0]).attr('class', 'tamanho-button-especial-big');
                          $($(el1).find('input')[0]).attr('display', 'none');

                          if(this.checkLineHasImage(x)){
                            this.changeLineSize2(x, 'imgSize');
                          }
                          
                          //this.changeLineSize2(x, 'imgSize');

                        }

                      }
            
                        $(el1).removeAttr('tooltip');
                    

                     let formula = (this.globColumnQnty*x)+(y);
                      $("[id=content]")[formula].appendChild(el1);

                      continue;
                    } 


       })
       

    }
  


    private convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){
      if(!layout) return;
      keyboard.teclas = [];
      keyboard.text = [];
      keyboard.action = [];  
      keyboard.image = [];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

      for(let i = 0; i < layout.Lines.length; i++){ 
        let line = []; 
        let textL = [];
        let actionL = [];
        let imageL = [];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        for(let j = 0; j < layout.Lines[i].Buttons.length; j++){ 
          line.push(layout.Lines[i].Buttons[j].Caption); 
          textL.push(layout.Lines[i].Buttons[j].Text); 
          actionL.push(layout.Lines[i].Buttons[j].Action); 
          imageL.push(layout.Lines[i].Buttons[j].Image);  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        } 
        keyboard.teclas.push(line); 
        keyboard.text.push(textL); 
        keyboard.action.push(actionL); 
        keyboard.image.push(imageL);  ////////////////////////////////ADICIONADO RECENTEMENTE /////////////////////////////// 
      } 

      keyboard.type = layout.nameLayout

  }


    public setKeyboardState(value){


      let newTitle = value[2].className.split('@');
      let title = newTitle[1];

      let parts = title.split("#");
      let x = <number>parts[0];
      let y = <number>parts[1];
      this.tecladoReplicant.teclas[y][x] = "";
      this.tecladoReplicant.text[y][x] = "";
      this.tecladoReplicant.action[y][x] = "";  
      this.tecladoReplicant.image[y][x] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

    }


    private onRemove(value){
      let DEBUG = false;

      if(DEBUG) console.log("MARK1");
        let drainX, drainY, drainParts, sourceX, sourceY, sourceParts, index, found;
        if(value[3].id === 'copy'){  
          sourceParts = value[3].className.split('$')[1].split('#');
          sourceX = sourceParts[0];
          sourceY = sourceParts[1];
      } else if ( value[3].id === 'content'){
          sourceParts = value[3].className.split(' ')[0].split('#');
          sourceX = sourceParts[0];
          sourceY = sourceParts[1];
      }   

      let isImage = false;

      if(this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] === '*img'){
        isImage = true;
      }

      if(DEBUG) console.log("MARK2");
      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
      this.tecladoReplicant.text[sourceY][sourceX] = "";
      this.tecladoReplicant.action[sourceY][sourceX] = "";  
      this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

      //SERVE PARA REMOVER ELEMENTOS DO imgLinesArray QUANDO SE REMOVE A FOTO
      if(isImage){
        if(DEBUG) console.log("MARK3");        
              found = false;
              this.count = 0;
              for(let u=0; u< this.tecladoReplicant.image[sourceY].length; u++){
                if(this.tecladoReplicant.image[sourceY][u] !== ""){
                  found = true;
                  this.count +=1;
                  if(DEBUG) console.log("MARK4");
                  //if(!this.imgLinesArray.includes(sourceY.toString())){
                  //  this.imgLinesArray.push(sourceY);
                 // }
                }
              }
              if(DEBUG) console.log(found);
              if(DEBUG) console.log(this.count);
              
              if(!found || this.count >= 1){
                if(DEBUG) console.log("MARK5");
                if(this.imgLinesArray.includes(sourceY.toString())){
                  if(DEBUG) console.log('SOURCE: ' + sourceY);
                  index = this.imgLinesArray.indexOf[sourceY];
                  for(let i = 0; i < this.imgLinesArray.length; i++){
                    if(this.imgLinesArray[i] === sourceY){
                      if(DEBUG) console.log("MARK6");
                      index = i;
                    }
                  }

                  if(DEBUG)  console.log('INDEX: ' + index);
                  this.imgLinesArray.splice(index, 1);
                }
              }
              
              if(DEBUG) console.log("MARK7");
              found = false;
              // for(let y=0; y < this.tecladoReplicant.image.length; y++){
              //   for(let x=0;  x < this.tecladoReplicant.image[y].length; x++){
              //       if(this.tecladoReplicant.image[y][x] !== ""){
              //         if(!this.imgLinesArray.includes(y.toString())){
              //            this.imgLinesArray.push(y);
              //         }
              //       }
              //   }
              // }
      }        
      console.log(this.checkLineHasImage(sourceY));
      if(isImage){
          if(!this.checkLineHasImage(sourceY)){
            this.changeLineSize2(sourceY, 'default');
          }
      }
      
 

      console.log(JSON.stringify(this.imgLinesArray));
      //console.log(JSON.stringify(this.tecladoReplicant.image));

    }  


    private onDrop(value) {
      //console.clear();
      //let DEBUG = false;
      let DEBUG = true;
      if (value[2] == null) {//dragged outside any of the bags
          return;
      }    
          let drainX, drainY, drainParts, sourceX, sourceY, sourceParts, isContent = false, isCopy = false;
          let index, found;

          if(value[3].id === 'copy'){  
              isCopy = true;
              sourceParts = value[3].className.split('$')[1].split('#');
      
              sourceX = sourceParts[0];
              sourceY = sourceParts[1];
          } else if ( value[3].id === 'content'){
              isContent = true;
              sourceParts = value[3].className.split(' ')[0].split('#');

              sourceX = sourceParts[0];
              sourceY = sourceParts[1];
          }   

          if(value[2].id === 'content'){
              isContent = true;

              drainParts = value[2].className.split(' ')[0].split('#');
  
              drainX = drainParts[0];
              drainY = drainParts[1];
          }    

          //console.log('SOURCE ON DROP: ' + sourceY);
          //console.log('DRAIN ON DROP: ' + drainY);


          if(this.imgLinesArray.includes(sourceY.toString())){
            //index = this.imgLinesArray.indexOf[sourceY];
            for(let i = 0; i < this.imgLinesArray.length; i++){
              if(this.imgLinesArray[i] === sourceY){
                if(DEBUG) console.log("MARK-DROP-8");
                index = i;
              }
            }
          }


          if(sourceY !== drainY) this.imgLinesArray.splice(index, 1);

          console.log(JSON.stringify(this.imgLinesArray));  

          if(this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] === '*img' && drainY !== sourceY){

            this.imgLinesArray.push(drainY);
              console.log(JSON.stringify(this.imgIsModified));
              
              let choice = false;
              //console.log("DRAIN");

              if( !this.checkLineHasImage(drainY) ) {//&& !this.imgIsModified.includes(drainY.toString())){
                //console.log("NÃO TEM IMAGEM NO DRAIN");
                
                  this.changeLineSize2(drainY, 'imgSize');
              } 

              //console.log("SOURCE");
              if(this.checkLineHasImage(sourceY) ){
                //console.log("NÃO TEM IMAGEM NO SOURCE");
                
                this.changeLineSize2(sourceY, 'default');
              } 

            }
            

            

             //this.imgLinesArray.push(drainY);

            

          console.log(JSON.stringify(this.imgLinesArray));

          
   
                let trueValue, copyObj, objClass, trueObj, toSource;

                if($(value).find('button')){
                  
                  this.lastKind = $(value[1])[0].id ; 
                  trueValue = $($(value[1])[0]).val() ;
                  
                  if(!this.editMode){
                          if($(value[2]).children().length > 2 ) {   
              
                            if(DEBUG) console.log("MARK-DROP-9");

                            value[1].remove();  
                            trueValue = $($(value[1])[0]).val() ;
                            
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                            this.tecladoReplicant.action[sourceY][sourceX] = "";  
                            this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } else {
                            trueValue = $($(value[1])[0]).val() ;
                 
                                          
                            if(DEBUG) console.log("MARK-DROP-10");



                            if(this.tecladoReplicant.text[sourceY][sourceX]!== "" && this.tecladoReplicant.teclas[sourceY][sourceX]!== ""){ 
                              if(isContent && !isCopy){

                                                                          
                                if(DEBUG) console.log("MARK-DROP-11");


                                  this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";

                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX];
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 

                                  this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX]; 
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";
                                  
                                  this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              
                                } else if (isContent && isCopy){

                                                                            
                                  if(DEBUG) console.log("MARK-DROP-12");


                                  this.tecladoReplicant.teclas[drainY][drainX] = trueValue;

                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 

                                  this.tecladoReplicant.action[drainY][drainX] = trueValue;
                                  
                                  this.tecladoReplicant.image[drainY][drainX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  
                              }
                            } else {

                                                                            
                              if(DEBUG) console.log("MARK-DROP-13");

                              if(trueValue){
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                              
                              } else {
                                this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              }
                              
                                //this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                //this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                                //this.tecladoReplicant.teclas[sourceY][sourceX] = "";

                                this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                this.tecladoReplicant.text[drainY][drainX] = trueValue;
                                
                                
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  

                                if(this.tecladoReplicant.image[sourceY][sourceX] !== ""){
                                  this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                } else {
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                }
                                //this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                //this.tecladoReplicant.image[drainY][drainX] =

                                if(trueValue === "*mic"){
                                  this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                } else {

                                
                                this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  

                                }
                            }    
                            
                          } 
                          $(value[1])[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                  } else {
                          if($(value[2]).children().length > 1 ) {   

                                                                                                        
                            if(DEBUG) console.log("MARK-DROP-14");


                            value[1].remove();  
                            trueValue = $($(value[1])[0]).val() ;
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                            this.tecladoReplicant.action[sourceY][sourceX] = "";
                            
                            this.tecladoReplicant.image[sourceY][sourceX] = ""; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } else {
       
                                                                            
                            if(DEBUG) console.log("MARK-DROP-14");


                            if($(value[1]).find('input')[0]){
                              trueValue = $($(value[1]).find('input')[0]).val();
                            } else if($(value[1]).find('button')[0]){
                              trueValue = $($(value[1]).find('button')[0]).val();
                            }
 

                 
                            if(this.tecladoReplicant.text[sourceY][sourceX]!== ""  && this.tecladoReplicant.teclas[sourceY][sourceX]!== ""){
  
                      
                                  if(isContent && !isCopy){
      
                                                                                                                
                                    if(DEBUG) console.log("MARK-DROP-15");


                                    this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX]; 
                                    this.tecladoReplicant.teclas[sourceY][sourceX] = ""; 
                                  
                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 

                                    this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX]; 
                                    this.tecladoReplicant.action[sourceY][sourceX] = "";
                                    
                                    
                                    this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                    this.tecladoReplicant.image[sourceY][sourceX] = ""; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


                                } else if (isContent && isCopy){
            
                                                                                         
                                  if(DEBUG)  console.log("MARK-DROP-15");


                                    this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  

                                    
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                                    
                                    if(trueValue === "*mic"){
                                      this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                    } else {

                                      this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  

                                    }

                                    this.tecladoReplicant.image[drainY][drainX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                                }
                              } else {

                                                                            
                                if(DEBUG)  console.log("MARK-DROP-16");



                                if(trueValue && this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] !== "*img"){
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                                  if(DEBUG)  console.log("MARK-DROP-16-A");
                                } else {
                                  this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  if(DEBUG)  console.log("MARK-DROP-16-B");
                                }


                      
  
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 

                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  

                                  
                                if(this.tecladoReplicant.image[sourceY][sourceX] !== ""){
                                  if(DEBUG)  console.log("MARK-DROP-16-C");
                                  this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                                } else {
                                  if(DEBUG)  console.log("MARK-DROP-16-D");
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                }
                                 
                                  if(trueValue === "*mic"){
                                    this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                  } else {

                                    this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  

                                  }
                              }    

       
                          } 
                          console.log("CLASS CHANGER");
                          $(value[1])[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                          //$($(value[1])[0]).css('display', 'none');
                          if($($(value[1])[0]).find('input')[0]){ 
                                  $($(value[1])[0]).find('input')[0].className = 'tamanho-button-especial-big' + ' ' + drainX + '#' + drainY + '';
                                  $($(value[1])[0]).find('input')[0].setAttribute('display', 'none');
                                  $($($(value[1])[0]).find('input')[0]).attr('display', 'none');
                                  //$($($(value[1])[0]).find('input')[0]).css('display', 'none');
                          }          
        
                  }   


                  if(!this.checkLineHasImage(sourceY)){
                    this.changeLineSize2(sourceY, 'default');
                  } else {
                    this.changeLineSize2(sourceY, 'imgSize');
                  }

                  console.log(JSON.stringify(this.imgLinesArray));
                  console.log(JSON.stringify(this.tecladoReplicant.teclas) );
                  return;
                }

                if(value[3].id === "copy"){
                  
                  this.lastKind = value[3].id ; 

                                                                            
                  if(DEBUG) console.log("MARK-DROP-17");


      
                    trueValue = $($(value[3]).find('input')[0]).val();
                    copyObj = $(value[3]).find('input')[0];
                    objClass = $(value[3]).find('input')[0].className;
                    $(value[2]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                    
                    if($(value[2]).children().length > 2 ) {   
      
                        value[1].remove();  
                        trueValue = $($(value[1])[0]).val();

                                                                            
                        if(DEBUG) console.log("MARK-DROP-18");


                        this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                        this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                        this.tecladoReplicant.action[sourceY][sourceX] = "";  

                        this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                    } else {
  
                                                                                                  
                      if(DEBUG) console.log("MARK-DROP-19");



                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                        this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                      

                      if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                          this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                          this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                                                             
                          if(DEBUG) console.log("MARK-DROP-20");


                    } else {

                                                                                                   
                      if(DEBUG) console.log("MARK-DROP-21");


                          this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                          this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                    } 



                    
                    if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ 
                                                                             
                      if(DEBUG) console.log("MARK-DROP-22");



                          this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  
                          this.tecladoReplicant.action[sourceY][sourceX] = "";  
                    } else {  
                                                                             
                      if(DEBUG) console.log("MARK-DROP-23");


                          this.tecladoReplicant.action[sourceY][sourceX] = "";  
                          
                          if(trueValue === "*mic"){
                            this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                          } else {
                          
                            this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  

                          }
                    } 


                    if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                                                             
                      if(DEBUG) console.log("MARK-DROP-24");



                        this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                        this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                    } else {   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                                                                                   
                      if(DEBUG)  console.log("MARK-DROP-25");


                        this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                    } ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


                    } 
                    
                } else if ( value[3].id === "content"){
                                                                             
                  if(DEBUG) console.log("MARK-DROP-26");


                  this.lastKind = value[3].id ; 
                  
      
                    trueValue = $($(value[1])[0]).val();
                    copyObj = $(value[1])[0];
                    objClass = $(value[1])[0].className;

                    if($(value[2]).children().length > 2) { 
                                                                                   
                      if(DEBUG) console.log("MARK-DROP-27");


                      value[1].remove();  
                      trueValue = $($(value[1])[0]).val();
    
                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                      this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                      this.tecladoReplicant.action[sourceY][sourceX] = "";
                      
                      this.tecladoReplicant.image[sourceY][sourceX] = ""; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                    } else {
                                                                             
                      if(DEBUG) console.log("MARK-DROP-28");

                      trueValue = $( $(value[1]).children()[0] ).val();
                      if($(value[2]).children().length > 2  ) { 
     
                          value[1].remove();
                          
   
                          
                          this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                      this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                          
                          if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                            
                                                                             
                            if(DEBUG) console.log("MARK-DROP-29");


                            
                            this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                    } else {
                                                                             
                      if(DEBUG)  console.log("MARK-DROP-30");


  
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                          }  
   

                          if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ 

                            if(DEBUG) console.log("MARK-DROP-31");

                            this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  
                            this.tecladoReplicant.action[sourceY][sourceX] = "";  
                          } else {  
  
                            if(DEBUG)  console.log("MARK-DROP-32");


                            this.tecladoReplicant.action[sourceY][sourceX] = "";  
                            
                            if(trueValue === "*mic"){
                              this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                            } else {
                              this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  
                            }  
                          }


                          
                          if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              
                            if(DEBUG) console.log("MARK-DROP-33");


                            this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } else {   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              
                            if(DEBUG) console.log("MARK-DROP-34");


                            this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////




                      } else {
        
                          
                        if(DEBUG) console.log("MARK-DROP-35");


                        if( $(value[1]).find('input')[0]) {
     
                          trueValue = $($($(value[1])[0]).find('input')[0]).val();
                          if(this.editMode){
                            if($(value[2]).children().length > 1) {
                              

                                
                              if(DEBUG) console.log("MARK-DROP-36");


                              value[1].remove();
                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                this.tecladoReplicant.action[sourceY][sourceX] = "";   

                                this.tecladoReplicant.image[sourceY][sourceX] = "";    ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } else {
                              
  
                              if(DEBUG)  console.log("MARK-DROP-37");


                              
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                              

                              if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){

  
                                if(DEBUG)  console.log("MARK-DROP-38");



                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              } else {
                                
  
                                if(DEBUG) console.log("MARK-DROP-39");


                                
                                this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                              }  
    


                              if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ 
  
                                if(DEBUG)  console.log("MARK-DROP-40");


  

                                this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  
                            } else { 
 
 
                              if(DEBUG)  console.log("MARK-DROP-41");


                                this.tecladoReplicant.action[sourceY][sourceX] = "";  
                               
                                if(trueValue === "*mic"){
                                  this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                } else {
                                  this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  
                                }  
                            }  



                            

                            if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                               
                              if(DEBUG) console.log("MARK-DROP-42");


                              this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } else {  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                             
                            if(DEBUG) console.log("MARK-DROP-43");


                              this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          }   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


                            }    
                          } else {
                            if($(value[2]).children().length > 2) {
           
                              value[1].remove();
                              
 
                              if(DEBUG)  console.log("MARK-DROP-44");


                              
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              this.tecladoReplicant.action[sourceY][sourceX] = "";  

                              this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } else {
                              
 
                              if(DEBUG)  console.log("MARK-DROP-45");



                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  


                              if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){

 
                                if(DEBUG)  console.log("MARK-DROP-46");



                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              } else {
 
                                if(DEBUG) console.log("MARK-DROP-47");


                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                              }
                              
                              

                              if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ 

 
                                if(DEBUG) console.log("MARK-DROP-48");


                                this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  
                            } else { 

     
                              if(DEBUG) console.log("MARK-DROP-49");


                                this.tecladoReplicant.action[sourceY][sourceX] = "";  
                                
                                if(trueValue === "*mic"){
                                  this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                } else {

                                    this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  
                                }    
                            }



                            
                            if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                               
                              if(DEBUG)  console.log("MARK-DROP-50");


                              this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } else {  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                             
                            if(DEBUG) console.log("MARK-DROP-51");


                              this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


         
                            } 
                          }  
  
                        } else {

                          trueValue = $($(value[1])[0]).val();
                            if(this.editMode){
                              if($(value[2]).children().length > 1) {
          
                                  value[1].remove();

                               
                                  if(DEBUG)   console.log("MARK-DROP-52");

                                  
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.text[sourceY][sourceX] = "";
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  

                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              } else {
                             
                                if(DEBUG)  console.log("MARK-DROP-53");


                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                                

                                if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                             
                                  if(DEBUG)  console.log("MARK-DROP-54");


                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                } else {
                             
                                  if(DEBUG)  console.log("MARK-DROP-55");


                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                                }
                                
                                


                                if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ 
                             
                                  if(DEBUG)   console.log("MARK-DROP-56");


                                  this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  
                              } else { 

                             
                                if(DEBUG)  console.log("MARK-DROP-57");


                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  
                                  
                                  
                                  if(trueValue === "*mic"){
                                    this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                  } else {
                                  
                                      this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  
                                   
                                  }    
                              }
                              

                              if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                                             
                                if(DEBUG) console.log("MARK-DROP-58");


                                this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } else {  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                                           
                              if(DEBUG) console.log("MARK-DROP-59");


                                this.tecladoReplicant.image[sourceY][sourceX] = "";       ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


                              }    
                            } else {
                              if($(value[2]).children().length > 2) {
       
                                  value[1].remove();
                             
                                  if(DEBUG) console.log("MARK-DROP-60");



                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              } else {
                             
                                if(DEBUG)   console.log("MARK-DROP-61");

             
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  


                                if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                             
                                  if(DEBUG)    console.log("MARK-DROP-62");


                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                } else {
                             
                                  if(DEBUG)  console.log("MARK-DROP-63");


                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                                }  
       


                                if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ 
                                     
                                  if(DEBUG)  console.log("MARK-DROP-64");


                                  this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  
                              } else { 
                             
                                if(DEBUG) console.log("MARK-DROP-65");


                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  
                                  
                                  if(trueValue === "*mic"){
                                    this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                  } else {
                                  
                                      this.tecladoReplicant.action[drainY][drainX] = 'Keyboard'; 
                                   
                                  }    
                              }  



                              if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                                             
                                if(DEBUG)  console.log("MARK-DROP-66");


                                this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } else {  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                                           
                              if(DEBUG) console.log("MARK-DROP-67");


                                this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////







                              }   
                            }  

    }    
                      } 
                    } 

                    
                }    
                
                
                  if(!this.checkLineHasImage(sourceY)){
                    this.changeLineSize2(sourceY, 'default');
                  } else {
                    this.changeLineSize2(sourceY, 'imgSize');
                  }
              

                console.log(JSON.stringify(this.tecladoReplicant.teclas) );
                console.log(JSON.stringify(this.imgLinesArray));
                objClass = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
   
             
    }    

    
    public showModal(component){
        const activeModal = this.modalService.open(component, {size: 'lg', container: 'nb-layout'});
        this.modal = activeModal;
    }

    public closeModal(){
      this.modal.close();
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
                  openFacLayout.Lines[i].Buttons[j].Action = teclado.action[i][j];
                  openFacLayout.Lines[i].Buttons[j].Caption = teclado.teclas[i][j]; 
                  openFacLayout.Lines[i].Buttons[j].Text = teclado.text[i][j]; 
                  openFacLayout.Lines[i].Buttons[j].Image = teclado.image[i][j];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
          }
      } 

      return openFacLayout;
   }

   public deleteKeyboardLayout(){
    this.showModal(DeleteLayoutModalComponent);
    

    this.keyboardItems.KeyboardsNames.push(this.keyboardName);
    this.keyboardToEdit = this.keyboardName;
   }


   public saveKeyboardLayout(saveAs?: boolean){
     if(!saveAs){
            if(this.keyboardToEdit === 'pt-br'){
              let message = this.messageService.getTranslation('MENSAGEM_SOBRESCREVER_TECLADO_SISTEMA');
              this.messageService.error(message);
              return;
            }
      }      
      // LOAD LAYOUT CONFIGURATION OBJECT
      let totalLines = 0;
      let finalKeyboard = new TecladoModel;
      finalKeyboard.teclas = [];
      finalKeyboard.text = [];
      finalKeyboard.action = [];
      finalKeyboard.image = [];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


      for(let i = 0; i< this.tecladoReplicant.teclas.length; i++){ 
        let tam = 0; 
        let teclasLine = new Array(); 
        let textLine = new Array(); 
        let actionLine = new Array();  
        let imageLine = new Array();   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        teclasLine = []; 
        textLine = []; 
        actionLine = [];  
        imageLine = [];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        for(let j=0; j < this.tecladoReplicant.teclas[i].length; j++){ 
           if(this.tecladoReplicant.teclas[i][j] !== "" && this.tecladoReplicant.teclas[i][j] !== " "){ 
             teclasLine.push(this.tecladoReplicant.teclas[i][j]); 
             textLine.push(this.tecladoReplicant.text[i][j]); 
             actionLine.push(this.tecladoReplicant.action[i][j]);  
             imageLine.push(this.tecladoReplicant.image[i][j]);   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
             tam += 1; 
            }  

        }

        if(tam > 0) { 
          finalKeyboard.teclas.push(teclasLine);  
          finalKeyboard.text.push(textLine);
          finalKeyboard.action.push(actionLine); 
          finalKeyboard.image.push(imageLine);  ////////////////////////////////ADICIONADO RECENTEMENTE /////////////////////////////// 
            totalLines += 1;
        }    

      }


      if(totalLines === 0) {
        let message = this.messageService.getTranslation('MENSAGEM_SALVAR_TECLADO_VAZIO')
        this.messageService.error(message);
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
                    let message;
                    if(result === 'saved'){
                      message = this.messageService.getTranslation('MENSAGEM_TECLADO_SALVO');
                      this.messageService.success(message);
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
                                  
                                   message = this.messageService.getTranslation('MENSAGEM_TECLADO_SALVO');
                      			   this.messageService.success(message);
                                   this.sidebarService.emitSideBarCommand('reload');

                                   this.keyboardItems.KeyboardsNames.push(this.keyboardName);

                    } else if (result === 'maxNumber'){
                      message = this.messageService.getTranslation('MENSAGEM_QNTD_TECLADOS_ULTRAPASSADA');
                      this.messageService.error(message);
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
            
            this.layoutEditorService.saveUpdateKeyboard(layout, user.email).subscribe((result)=>{
              let message;
              if(result === 'updated'){
                this.messageService.success("Layout Salvo! Todas as linhas e colunas em branco foram suprimidas.");
				message = this.messageService.getTranslation('MENSAGEM_TECLADO_SALVO');
                this.messageService.success(message);
				this.keyboardItems.KeyboardsNames.push(this.keyboardName);
                this.sidebarService.emitSideBarCommand('reload');
              } else if (result === 'alreadyExist'){
                message = this.messageService.getTranslation('MENSAGEM_TECLADO_JA_EXISTE');
                this.messageService.error(message);
              } else if (result === 'maxNumber'){
                message = this.messageService.getTranslation('MENSAGEM_QNTD_TECLADOS_ULTRAPASSADA');
                this.messageService.error(message);
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
        this.teclado.text[i] = [[]]; 
        this.teclado.action[i] = [[]];
        this.teclado.image[i] = [[]];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        this.tecladoReplicant.teclas[i] = [[]];
        this.tecladoReplicant.text[i] = [[]];
        this.tecladoReplicant.action[i] = [[]];  
        this.tecladoReplicant.image[i] = [[]];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
         let line = new Array();
         let textL = new Array(); 
         let actionL = new Array();  
         let imageL = new Array();   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
         let lineReplicant = new Array();
         let textReplicant = new Array(); 
         let actionReplicant = new Array(); 
         let imageReplicant = new Array();  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
         line = [];
         textL = []; 
         actionL = [];  
         imageL = [];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
         lineReplicant = [];
         textReplicant = [];
         actionReplicant = [];   
         imageReplicant = [];    ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
          for (let j = 0; j < 14; j++) {
              line[j] = "";
              textL[j] = "";  
              actionL[j] = "";   
              imageL[j] = "";    ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
              lineReplicant[j] = "";
              textReplicant[j] = ""; 
              actionReplicant[j] = "";  
              imageReplicant[j] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

          }

          this.teclado.teclas[i] = line;
          this.teclado.text[i] = textL; 
          this.teclado.action[i] = actionL; 
          this.teclado.image[i] = imageL;  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
          this.tecladoReplicant.teclas[i] = lineReplicant;  
          this.tecladoReplicant.text[i] = textReplicant;  
          this.tecladoReplicant.action[i] = actionReplicant;  
          this.tecladoReplicant.image[i] = imageReplicant;   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

          this.lines = this.teclado.teclas.length;
      }  
      

      var row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
      var pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
      var sRow: string[] = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn', 'PULA', '*arrowdown'];
      var tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '*arrowleft', '*arrowright', '*arrowup', ''];
      var zRow: string[] = ['*mic', '*space', '', '', '', '', '', '', '', '', '', '', '', ''];

       this.masterKeys.teclas.push(row);
       this.masterKeys.teclas.push(pRow);
       this.masterKeys.teclas.push(sRow);
       this.masterKeys.teclas.push(tRow);
       this.masterKeys.teclas.push(zRow); 


    }

    public addLine(){
        let line = new Array();
        let lineReplicant = new Array();
        line = [];
        lineReplicant = [];
        for (let j = 0; j < 14; j++) {
            line.push('');
            lineReplicant[j] = '';
        }
        this.teclado.teclas.push(line);  
        this.teclado.text.push(line); 
        this.teclado.action.push(line);
        this.teclado.image.push(line);   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        this.tecladoReplicant.teclas[this.tecladoReplicant.teclas.length] = lineReplicant;
        this.tecladoReplicant.text[this.tecladoReplicant.text.length] = lineReplicant; 
        this.tecladoReplicant.action[this.tecladoReplicant.action.length] = lineReplicant;  
        this.tecladoReplicant.image[this.tecladoReplicant.image.length] = lineReplicant;   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        
        this.lines = this.teclado.teclas.length;
    }  
    
    public removeLine(){
      if(this.teclado.teclas.length > 5){
          this.teclado.teclas.pop();
          this.teclado.text.pop();
          this.teclado.action.pop();   
          this.teclado.image.pop();   
          this.tecladoReplicant.teclas.pop();
          this.tecladoReplicant.text.pop(); 
          this.tecladoReplicant.action.pop();  
          this.tecladoReplicant.image.pop();  
          
          this.lines = this.teclado.teclas.length;
      } else {
        this.messageService.error("O mínimo de linhas no modo edição é 5.");
    }  
    }  



    public editCaptionNText(event){
        
        
        this.showModal(CaptionTextModalComponent);
        
        console.log(JSON.stringify(this.imgLinesArray));
        let parts = event.target.className.split(' ');

        let text;
        let action;
        let image; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        if(parts[0].indexOf('#') !== -1){
          let x = <number>parts[0].split('#')[0];
          let y = <number>parts[0].split('#')[1];

          this.x = x;
          this.y = y;
          
          text = this.tecladoReplicant.text[y][x];
          action = this.tecladoReplicant.action[y][x];
          image = this.tecladoReplicant.image[y][x]; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
    
        } else {
          let x = <number>parts[1].split('#')[0];
          let y = <number>parts[1].split('#')[1];

          
          this.x = x;
          this.y = y;
          
          text = this.tecladoReplicant.text[y][x];
          action = this.tecladoReplicant.action[y][x];
          image = this.tecladoReplicant.image[y][x]; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
    
        }

        

        let payload = new Array();

        payload.push(event);
        payload.push(text);
        payload.push(action);
        payload.push(image); ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


        this.captionTextService.emitCaptionText(payload);
        
        

        this.payloadSubscription = this.layoutEditorService.subscribeToLayoutEditorPayloadSubject().subscribe((result)=>{


              let buttonText = "";
              buttonText = result[0];
              let buttonCaption = "";
              buttonCaption = result[1];

              let buttonAction = "";
              buttonAction = result[2];

              let buttonImage = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
              buttonImage = result[3];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

              let imgUrl = result[4];
              let height = result[5];
              let width = result[6];
              

              console.log("ALTURA: " + height + " LARGURA: " + width);

              console.log("KEY SIZE: " + this.keysWidthSize);
              let maxAdmissibleSize = this.keysWidthSize;
              let greaterDimension, smallerDimension;
              if(height > width){
                greaterDimension = height;
                smallerDimension = width;
              } else {
                greaterDimension = width;
                smallerDimension = height;
              }
              
              let conversionFactor = smallerDimension / greaterDimension;

              if(height > maxAdmissibleSize) { 
                height = maxAdmissibleSize;
                width = maxAdmissibleSize * conversionFactor;

              } else if(width > maxAdmissibleSize){
                width = maxAdmissibleSize;
                height = maxAdmissibleSize * conversionFactor;
              }

              if(height > this.imgMaxHeightSize){
                this.imgMaxHeightSize = height;
              }

              if(width > this.imgMaxWidthSize){
                this.imgMaxWidthSize = width;
              }

              console.log("NOVAS DIMNESÕES: " + height + 'x' + width); 

              if(buttonText === undefined) buttonText = " ";
              if(buttonCaption === undefined) buttonCaption = " ";
              if(buttonAction === undefined || buttonAction === "") buttonAction = "Keyboard";
              if(buttonImage === undefined) buttonImage = " ";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
          

              
              let parts = event.target.className.split(' ');
 
            
      
              if(parts[0].indexOf('#') !== -1){
     
                let x = <number>parts[0].split('#')[0];
                let y = <number>parts[0].split('#')[1];
                

                
                let formula = this.globColumnQnty*Number(y)+Number(x);
     
                let sEl = $("[id=copy]").clone();
                

 
                let el = sEl[<number>formula].cloneNode(true);


  
                if($(el).find('input')[0]){
       
                  $(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';

                  if(buttonCaption !== "*img") {
                      $($(el).find('input')[0]).attr('value', buttonCaption);
                  } else {
                    $($(el).find('input')[0]).attr('value', '');
                  }    
                  
                  if(imgUrl){
                      this.imgLinesArray.push(this.y);
                      console.log(JSON.stringify(this.imgLinesArray));
                      
                      this.changeDragulaBackground( $($(el)), "data:image/png;base64,"+ imgUrl, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);
                      $($(el).find('input')[0]).attr('class', 'tamanho-button-especial-big');
                      $($(el).find('input')[0]).attr('display', 'none');
                } 


                } else if($(el).find('button')[0]){
 
                  $(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                  
                  if($($(el).find('button')[0]).find('mat-icon')[0]) $($(el).find('button')[0]).find('mat-icon')[0].remove();
                  
                  $($(el).find('button')[0]).text(buttonCaption);
                  if(buttonCaption !== "*img") {
                      $($(el).find('button')[0]).attr('value', buttonCaption);
                  } else {
                    $($(el).find('button')[0]).attr('value', '');
                  }        
                  
                  if(imgUrl){
                    this.imgLinesArray.push(this.y);
                    
                    console.log(JSON.stringify(this.imgLinesArray));
                    this.changeDragulaBackground( $($(el)), "data:image/png;base64,"+ imgUrl, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);
                    $($(el).find('button')[0]).attr('class', 'tamanho-button-especial-big');
                    $($(el).find('button')[0]).attr('display', 'none');
                  } 

                }
                console.log("Dimensões recebidas: " + height + 'x' + width);

                this.tecladoReplicant.action[y][x] = buttonAction;
                this.tecladoReplicant.teclas[y][x] = buttonCaption + '$'+height+'#'+width ;
                this.tecladoReplicant.text[y][x] = buttonText;
                this.tecladoReplicant.image[y][x] = buttonImage;  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                
                console.log(JSON.stringify(this.tecladoReplicant.teclas));
                $(el).removeAttr('tooltip');
                
                
                $("[id=content]")[formula].appendChild(el);

                
                // //REDIMENSIONAMENTO DAS TECLAS

                if(imgUrl){
                      let sElContent = $("[id=content]");
                      let sElLines = $("[id=blankLines]");
                      let sElRows = $("[id=blankRows]");
                      let sElNone = $("[id=blankNone]");
                      console.log("TAMANHO: " + this.TAMANHO_DE_TESTE);
                  for(let imgLine = 0; imgLine < this.imgLinesArray.length ; imgLine++ ){
                    for(let col=0; col < this.globColumnQnty ; col++){
                      
                        let formula = this.globColumnQnty*Number(this.imgLinesArray[imgLine])+Number(col);
                        $($(sElContent)[formula]).css('height', this.imgMaxHeightSize);
                        $($(sElContent)[formula]).css('width', this.keysWidthSize);
                        $($(sElContent)[formula]).css('text-align', 'center');
                        $($(sElContent)[formula]).css("background-color", '#62FA02');
                        $($(sElLines)[this.imgLinesArray[imgLine]]).css('height', this.imgMaxHeightSize);
                        $($(sElRows)[this.imgLinesArray[imgLine]]).css('height', this.imgMaxHeightSize);

                        console.log('ARRAY INSERT: ' + this.imgLinesArray[imgLine]);
                        $($(sElLines)[this.imgLinesArray[imgLine]]).css('margin-bottom', 4);
                        $($(sElRows)[this.imgLinesArray[imgLine]]).css('margin-bottom', 4);
                    }    
                  }
                  
                }


              } else {
                //console.clear();

                let x = parts[1].split('#')[0];
                let y = parts[1].split('#')[1];
    
                let tecla = $($(event.target)[0]).val().toString();
   
                if(tecla === '*bckspc' || tecla === '*tab' || tecla === '*kbdrtrn' || tecla === 'PULA'
                    || tecla === '*arrowleft' || tecla === '*arrowright' || tecla === '*arrowup'
                    || tecla === '*arrowdown' || tecla === '*space' || tecla === "" || tecla === '*mic' ) {

                  this.messageService.error("Não é possível alterar teclas especiais.");
                  this.payloadSubscription.unsubscribe();
                  return;
                }
              

                $($(event.target)[0]).attr('value', buttonCaption);

                this.tecladoReplicant.teclas[y][x] = buttonCaption;
                this.tecladoReplicant.text[y][x] = buttonText;
                this.tecladoReplicant.action[y][x] = buttonAction;
                this.tecladoReplicant.image[y][x] = buttonImage;  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                //console.log(JSON.stringify(this.tecladoReplicant));
 
              }

              this.payloadSubscription.unsubscribe();
        })
        

      }


      public changeLineSize2(targetY: number, config: string){
        let sElContent = $("[id=content]");
        let sElLines = $("[id=blankLines]");
        let sElRows = $("[id=blankRows]");
        let sElNone = $("[id=blankNone]");

        if(config === 'default'){

                for(let col=0; col < this.globColumnQnty ; col++){
                  
                    let formula = this.globColumnQnty*Number(targetY)+Number(col);
                    $($(sElContent)[formula]).css('height', this.keysHeightSize);
                    $($(sElContent)[formula]).css('width', this.keysWidthSize);
                    $($(sElContent)[formula]).css("background-color", 'orange');

                    $($(sElLines)[targetY]).css('height', this.keysHeightSize);
                    $($(sElRows)[targetY]).css('height', this.keysHeightSize);
   
                    console.log("TARGET: " + targetY);
                    $($(sElLines)[targetY]).css('margin-bottom', 4 );
                    $($(sElRows)[targetY]).css('margin-bottom', 4 );
                }    
              //}
        } else if( config === 'imgSize'){
                  console.log("TAMANHO: " + this.TAMANHO_DE_TESTE);
              
                  for(let col=0; col < this.globColumnQnty ; col++){
                    
                  let formula = this.globColumnQnty*Number(targetY)+Number(col);
                  $($(sElContent)[formula]).css('height', this.imgMaxHeightSize);
                  $($(sElContent)[formula]).css('width', this.keysWidthSize);
                  $($(sElContent)[formula]).css("background-color", '#62FA02');

                  $($(sElLines)[targetY]).css('height', this.imgMaxHeightSize);
                  $($(sElRows)[targetY]).css('height', this.imgMaxHeightSize); 
                  
                  $($(sElLines)[targetY]).css('margin-bottom', 4 );
                  $($(sElRows)[targetY]).css('margin-bottom', 4 );

              }    
            //}
        }      
      }  


      public changeDragulaElSize(el: any, height:number, width:number){
          if(width === -1){
            el.css("height", height);
          } else if(height === -1){
            el.css("width", width);
          } else {
            el.css("height", height);
            el.css("width", width);
          }
      }

      public changeDragulaBackground(el: any, url:string, height: number, width: number, percentX:number, percentY:number){
        //el.css("background", "url(data:image/png;base64,"+ url +") no-repeat");

        el.css("background", "url("+ url +") no-repeat");
        //el.css("background-position",'10px center')
        let params = <string>(percentX + '% ' + percentY + '%');
        el.css("background-size", params);
        let percent = (((this.keysWidthSize-width)/2)/this.keysWidthSize)*100;

        el.css("transform", 'translateX('+ percent +'%)');
        el.css("height", height);
        el.css("width", width);
      }

      public checkExistence(iR: number){
        this.exist = this.imgLinesArray.includes(iR.toString());
        //console.log(this.exist);
      }

      public checkLineHasImage(Y: number) {
        //console.log(JSON.stringify(this.tecladoReplicant.teclas) );
          
        for(let z = 0; z < this.tecladoReplicant.teclas[Y].length; z++){

             if(this.tecladoReplicant.teclas[Y][z].split('$')[0] === '*img'){//} && z!== X) {

              console.log("LINHA " + Y + " TEM IMAGEM!");
              return true;
            } 
          
          }


          console.log("LINHA " + Y +  " NÃO TEM IMAGEM!");
          return false;
    }

      
}
