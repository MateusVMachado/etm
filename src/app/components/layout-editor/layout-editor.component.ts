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
import { Subscription, TimeInterval } from 'rxjs';
import { KeyboardNamesList } from '../sidebar/keyboards-list.model';

import * as $ from 'jquery';
import { SaveModalComponent } from './save-layout/save-modal.component';
import { CaptionTextModalComponent } from './caption-text/caption-text-modal.component';
import { CaptionTextService } from './caption-text/caption-text.service';

import * as moment from 'moment';

import { UserSessionModel, TimeIntervalUnit } from '../shared/models/userSession.model';
import { BackLoggerService } from '../shared/services/backLogger.service';


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
               self.tecladoReplicant.text[i][j] = "";
               self.tecladoReplicant.action[i][j] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
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
            this.tecladoReplicant.action[i][j] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
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
          this.tecladoReplicant.text[i][j] = "";
          this.tecladoReplicant.action[i][j] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        }
      }

      for(let i = 0 ; i< replicantFromDatabase.teclas.length; i++){
        for( let j = 0 ; j < replicantFromDatabase.teclas[i].length; j++){
          this.tecladoReplicant.teclas[i][j] = replicantFromDatabase.teclas[i][j];
          this.tecladoReplicant.text[i][j] = replicantFromDatabase.text[i][j];
          this.tecladoReplicant.action[i][j] = replicantFromDatabase.action[i][j]; 
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

       console.log("FROM DATABASE: ");
       console.log(JSON.stringify(replicantFromDatabase));
       
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
              
              if(this.tecladoReplicant.teclas[x][y].substring(0,1) === '*' ){
                for(let j=0; j < specialKeys.length; j++){
                  if(specialKeys[j][0] === this.tecladoReplicant.teclas[x][y] ){
                    el1 = sEl[specialKeys[j][1]].cloneNode(true);
                  }
                }
                
              } else {
                el1 = sEl[0].cloneNode(true);
              }
              
        
                      if(!$(el1).find('input')[0]){
        
                        $($(el1).find('button')[0]).attr('value', replicantFromDatabase.teclas[x][y]);
                        //$(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                        $(el1).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';

                        
                        
                      }  else {
                        
                        $($(el1).find('input')[0]).attr('value', replicantFromDatabase.teclas[x][y]);
                        //$(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                        $(el1).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                     

                      }
            
                        $(el1).removeAttr('tooltip');
                    

                     let formula = (this.globColumnQnty*x)+(y);
                      $("[id=content]")[formula].appendChild(el1);

                      continue;
                    } 

      //         if(index && index !== -1){
      //             let valor = valuesArray[index];
              
                  
      //             for(let cm = 0; cm < coordinatesMap.length; cm++ ){
      //               if(coordinatesMap[cm][0].toString().toLowerCase() === valor.toString().toLowerCase()){
      //                 ok = true;
      //                 let x = coordinatesMap[cm][1];
      //                 let y = coordinatesMap[cm][2];
      //                 this.tecladoReplicant.teclas[x][y] = valor;
      //                 this.tecladoReplicant.text[x][y] = valor; 
                      
                      

      //                 let el = sEl[i].cloneNode(true);
        
      //                 if(!$(el).find('input')[0]){
        
      //                   $($(el).find('button')[0]).attr('value', valor);
      //                   //$(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
      //                   $(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';

                        
                        
      //                 }  else {
                        
      //                   $($(el).find('input')[0]).attr('value', valor);
      //                   //$(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
      //                   $(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                     

      //                 }
            
      //                   $(el).removeAttr('tooltip');
                    

      //                let formula = (this.globColumnQnty*x)+(y);
      //                 $("[id=content]")[formula].appendChild(el);

      //                 continue;
      //               } 
                    

      //               if(!ok){

      //                 let found = false;
      //                 for(let k = 0; k < coordinatesMap.length; k++){
      //                   let index2 = $.inArray(coordinatesMap[k][0].toString().toLowerCase(), sElArray); 
    
                       
                        
      //                   for(let i = 0; i < notFoundArray.length; i++ ){

  
      //                     if(coordinatesMap[k][0].toString().toLowerCase() === notFoundArray[i][0].toString().toLowerCase()){
      //                         found = true;  
      //                         break;
      //                      }
      //             }                  

                       
      //                   if(!found && index2 === -1 ){ 
      //                     let map = new Array();

      //                     map.push(coordinatesMap[k][0]);
      //                     map.push(k);
  
      //                     notFoundArray.push(map);
      //         }    
      //                 }

      //               }

                 

      //             }

      //         }    
      //       } else {
      //         let index = $.inArray(($( $(sEl[i]).find('input')[0] ).clone()).val().toString().toLowerCase(), valuesArrayLower);

      //         if(index && index !== -1){
      //             let valor = valuesArray[index];
     

      //             let ok = false;

      //             for(let cm = 0; cm < coordinatesMap.length; cm++ ){
      //               if(coordinatesMap[cm][0].toString().toLowerCase() === valor.toString().toLowerCase()){
      //                 ok = true;
      //                 let x = coordinatesMap[cm][1];
      //                 let y = coordinatesMap[cm][2];
      //                 this.tecladoReplicant.teclas[x][y] = valor;
      //                 this.tecladoReplicant.text[x][y] = valor; 

                      

      //                 let el1 = sEl[i].cloneNode(true);
        
      //                 if(!$(el1).find('input')[0]){
        
      //                   $($(el1).find('button')[0]).attr('value', valor);
                        
      //                   $(el1).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                        
                        
      //                 }  else {
                        
      //                   $($(el1).find('input')[0]).attr('value', valor);
                        
      //                   $(el1).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                        

      //                 }
            
      //                 $(el1).removeAttr('tooltip');

      //                 let formula = (this.globColumnQnty*x)+(y);
      //                  $("[id=content]")[formula].appendChild(el1);
                     
      //                  continue;

      //               } 
                    
      //               if(!ok){

      //                 let found = false;
      //                 for(let k = 0; k < coordinatesMap.length; k++){
      //                   let index2 = $.inArray(coordinatesMap[k][0].toString().toLowerCase(), sElArray); 
   
                       
                        
      //                   for(let i = 0; i < notFoundArray.length; i++ ){

  
      //                     if(coordinatesMap[k][0].toString().toLowerCase() === notFoundArray[i][0].toString().toLowerCase()){
      //                         found = true;  
      //                         break;
      //               }
      //                   }     

                       
      //                   if(!found && index2 === -1 ){ 
      //                     let map = new Array();

      //                     map.push(coordinatesMap[k][0]);
      //                     map.push(k);
  
      //                     notFoundArray.push(map);
      //             }                    
      //                 }

      //               }



      //         }    
      //       } 
      //       } 



      //  }

       
      //  if(notFoundArray.length > 0 ){
      //    for(let i = 0; i< notFoundArray.length; i++){
      //       let el3 = sEl[0].cloneNode(true);
      //       let x = coordinatesMap[notFoundArray[i][1]][1];
      //       let y = coordinatesMap[notFoundArray[i][1]][2];
            
         
            
      //       if(!$(el3).find('input')[0]){
      //         $(el3).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
      //         $($(el3).find('button')[0]).attr('value', coordinatesMap[notFoundArray[i][1]][0] );
      //       }  else {
      //         $(el3).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
      //         $($(el3).find('input')[0]).attr('value', coordinatesMap[notFoundArray[i][1]][0] );
      //       }
      //       $(el3).removeAttr('tooltip');
      //       let formula = (this.globColumnQnty*x)+(y);
      //        $("[id=content]")[formula].appendChild(el3);
      //    }
      //  }

      console.log("AFTER 1");
      console.log(JSON.stringify(this.tecladoReplicant));

      console.log("AFTER 1");
      console.log(JSON.stringify(this.tecladoReplicant));

       })
       

    }
  


    private convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){
      if(!layout) return;
      keyboard.teclas = [];
      keyboard.text = [];
      keyboard.action = [];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

      for(let i = 0; i < layout.Lines.length; i++){ 
        let line = []; 
        let textL = [];
        let actionL = []; ////////////////////////////////ADICIONADO RECENTEMENTE /////////////////////////////// 
        for(let j = 0; j < layout.Lines[i].Buttons.length; j++){ 
          line.push(layout.Lines[i].Buttons[j].Caption); 
          textL.push(layout.Lines[i].Buttons[j].Text); 
          actionL.push(layout.Lines[i].Buttons[j].Action);  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        } 
        keyboard.teclas.push(line); 
        keyboard.text.push(textL); 
        keyboard.action.push(actionL);   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
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
      this.tecladoReplicant.action[y][x] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

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
      this.tecladoReplicant.text[sourceY][sourceX] = "";
      this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
      
    }  



    private onDrop(value) {

      if (value[2] == null) {//dragged outside any of the bags
          return;
      }    
          let drainX, drainY, drainParts, sourceX, sourceY, sourceParts, isContent = false, isCopy = false;


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


   
                let trueValue, copyObj, objClass, trueObj, toSource;

                if($(value).find('button')){
                  
                  this.lastKind = $(value[1])[0].id ; 
                  trueValue = $($(value[1])[0]).val() ;
                  
                  if(!this.editMode){
                          if($(value[2]).children().length > 2 ) {   
              
                            value[1].remove();  
                            trueValue = $($(value[1])[0]).val() ;
                            
                            console.log("MARK1");
                            
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                            this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } else {
                            trueValue = $($(value[1])[0]).val() ;
                 
                            

                            if(this.tecladoReplicant.text[sourceY][sourceX]!== "" && this.tecladoReplicant.teclas[sourceY][sourceX]!== ""){ 
                              if(isContent && !isCopy){
                                console.log("MARK2");
                                  this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";

                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX];
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 

                                  this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX]; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              } else if (isContent && isCopy){
                                console.log("MARK3");
                                  this.tecladoReplicant.teclas[drainY][drainX] = trueValue;

                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 

                                  this.tecladoReplicant.action[drainY][drainX] = trueValue;  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  
                              }
                            } else {
                              console.log("MARK4");
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;

                                this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                this.tecladoReplicant.text[drainY][drainX] = trueValue;
                                
                                
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            }    
                            
                          } 
                          $(value[1])[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                  } else {
                          if($(value[2]).children().length > 1 ) {   
                            
                            console.log("MARK5");
                            
                            value[1].remove();  
                            trueValue = $($(value[1])[0]).val() ;
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                            this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } else {
       

                            if($(value[1]).find('input')[0]){
                              trueValue = $($(value[1]).find('input')[0]).val();
                            } else if($(value[1]).find('button')[0]){
                              trueValue = $($(value[1]).find('button')[0]).val();
                            }
 

                 
                            if(this.tecladoReplicant.text[sourceY][sourceX]!== ""  && this.tecladoReplicant.teclas[sourceY][sourceX]!== ""){
                              console.log("MARK6"); 
                                  if(isContent && !isCopy){
                                    console.log("MARK7");
                                    this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX]; 
                                    this.tecladoReplicant.teclas[sourceY][sourceX] = ""; 
                                  
                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 

                                    this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                    this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                } else if (isContent && isCopy){
            
                                  console.log("MARK8");
                                    this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  

                                    
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                                    
                                    this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                }
                              } else {
                                console.log("MARK9");
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
  
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 

                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              }    

       
                          } 
                          
                          $(value[1])[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                          if($($(value[1])[0]).find('input')[0]) 
                                  $($(value[1])[0]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
        
                  }   
   
                  console.clear();
                  console.log(JSON.stringify(this.tecladoReplicant) );
                  return;
                }

                if(value[3].id === "copy"){
                  
                  this.lastKind = value[3].id ; 


      
                    trueValue = $($(value[3]).find('input')[0]).val();
                    copyObj = $(value[3]).find('input')[0];
                    objClass = $(value[3]).find('input')[0].className;
                    $(value[2]).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + drainX + '#' + drainY + '';
                    
                    if($(value[2]).children().length > 2 ) {   
      
                        value[1].remove();  
                        trueValue = $($(value[1])[0]).val();

                        console.log("MARK10");

                        this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                        this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                        this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                    } else {
  
                      console.log("MARK11");

                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                        this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                      

                      if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                          this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                          this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                          console.log("MARK12");
                    } else {
                      console.log("MARK13");
                          this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                          this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                    } 



                    
                    if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                      console.log("MARK14");
                          this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                    } else {  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                      console.log("MARK15");

                          this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                    } 



                    } 
                    
                } else if ( value[3].id === "content"){

                  this.lastKind = value[3].id ; 
                  
      
                    trueValue = $($(value[1])[0]).val();
                    copyObj = $(value[1])[0];
                    objClass = $(value[1])[0].className;

                    if($(value[2]).children().length > 2) { 
      
                      value[1].remove();  
                      trueValue = $($(value[1])[0]).val();
                      console.log("MARK16");
                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                      this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                      this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                    } else {

                      trueValue = $( $(value[1]).children()[0] ).val();
                      if($(value[2]).children().length > 2  ) { 
     
                          value[1].remove();
                          
                          console.log("MARK17");
                          
                          this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                      this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                          
                          if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                            
                            console.log("MARK18");
                            
                            this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                    } else {

                      console.log("MARK19");

                              this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                          }  
   

                          if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                            console.log("MARK20");

                            this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          } else {  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            console.log("MARK21");
                            this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                          }





                      } else {
        
                        if( $(value[1]).find('input')[0]) {
     
                          trueValue = $($($(value[1])[0]).find('input')[0]).val();
                          if(this.editMode){
                            if($(value[2]).children().length > 1) {
                              
                              console.log("MARK22");
                              
                              value[1].remove();
                      this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                this.tecladoReplicant.action[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } else {
                              
                              console.log("MARK23");
                              
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                              

                              if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){

                                console.log("MARK24");

                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              } else {
                                
                                console.log("MARK25");
                                
                                this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                              }  
    


                              if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                                console.log("MARK26");

                                this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } else { ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                             
                              console.log("MARK27");

                                this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            }  






                            }    
                          } else {
                            if($(value[2]).children().length > 2) {
           
                              value[1].remove();
                              
                              console.log("MARK28");
                              
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } else {
                              
                              console.log("MARK29");

                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                      this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  


                              if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){

                                console.log("MARK30");

                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              } else {
                                console.log("MARK31");
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                              }
                              
                              

                              if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                console.log("MARK32");

                                this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            } else { ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                              console.log("MARK33");
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                            }




         
                            } 
                          }  
  
                        } else {

                          trueValue = $($(value[1])[0]).val();
                            if(this.editMode){
                              if($(value[2]).children().length > 1) {
          
                                  value[1].remove();
                                  
                                  console.log("MARK34");
                                  
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.text[sourceY][sourceX] = "";
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              } else {
                                console.log("MARK35");

                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                                

                                if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){

                                  console.log("MARK36");

                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                } else {

                                  console.log("MARK37");

                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                                }
                                
                                


                                if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                                  console.log("MARK38");

                                  this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              } else { ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                                console.log("MARK39");

                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              }



                              }    
                            } else {
                              if($(value[2]).children().length > 2) {
       
                                  value[1].remove();

                                  console.log("MARK40");

                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              } else {
             
                                console.log("MARK41");
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  


                                if(this.tecladoReplicant.text[sourceY][sourceX]!== ""){
                                  console.log("MARK42");
                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                } else {
                                  console.log("MARK43");
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                                }  
       


                                if(this.tecladoReplicant.action[sourceY][sourceX]!== ""){ ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  console.log("MARK44");
                                  this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              } else { ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

                                console.log("MARK45");
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                  this.tecladoReplicant.action[drainY][drainX] = 'Keyboard'; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                              }  



                              }   
                            }  

    }    
                      } 
                    } 

                }    
                console.clear();
                console.log(JSON.stringify(this.tecladoReplicant) );
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
                  //openFacLayout.Lines[i].Buttons[j].Action = 'Keyboard';
                  //openFacLayout.Lines[i].Buttons[j].Action = 'TTS';
                  openFacLayout.Lines[i].Buttons[j].Action = teclado.action[i][j];
                  openFacLayout.Lines[i].Buttons[j].Caption = teclado.teclas[i][j]; 
                  openFacLayout.Lines[i].Buttons[j].Text = teclado.text[i][j]; 
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
      finalKeyboard.action = [];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


      for(let i = 0; i< this.tecladoReplicant.teclas.length; i++){ 
        let tam = 0; 
        let teclasLine = new Array(); 
        let textLine = new Array(); 
        let actionLine = new Array();  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        teclasLine = []; 
        textLine = []; 
        actionLine = [];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        for(let j=0; j < this.tecladoReplicant.teclas[i].length; j++){ 
           if(this.tecladoReplicant.teclas[i][j] !== "" && this.tecladoReplicant.teclas[i][j] !== " "){ 
             teclasLine.push(this.tecladoReplicant.teclas[i][j]); 
             textLine.push(this.tecladoReplicant.text[i][j]); 
             actionLine.push(this.tecladoReplicant.action[i][j]);  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
             tam += 1; 
            }  

        }

        if(tam > 0) { 
          finalKeyboard.teclas.push(teclasLine);  
          finalKeyboard.text.push(textLine);
          finalKeyboard.action.push(actionLine); ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
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
        this.teclado.action[i] = [[]];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        this.tecladoReplicant.teclas[i] = [[]];
        this.tecladoReplicant.text[i] = [[]];
        this.tecladoReplicant.action[i] = [[]];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
         let line = new Array();
         let textL = new Array(); 
         let actionL = new Array();  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
         let lineReplicant = new Array();
         let textReplicant = new Array(); 
         let actionReplicant = new Array(); ////////////////////////////////ADICIONADO RECENTEMENTE /////////////////////////////// 
         line = [];
         textL = []; 
         actionL = [];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
         lineReplicant = [];
         textReplicant = [];
         actionReplicant = [];   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
          for (let j = 0; j < 14; j++) {
              line[j] = "";
              textL[j] = "";  
              actionL[j] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
              lineReplicant[j] = "";
              textReplicant[j] = ""; 
              actionReplicant[j] = "";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////

          }

          this.teclado.teclas[i] = line;
          this.teclado.text[i] = textL; 
          this.teclado.action[i] = actionL; 
          this.tecladoReplicant.teclas[i] = lineReplicant;  
          this.tecladoReplicant.text[i] = textReplicant;  
          this.tecladoReplicant.action[i] = actionReplicant;  
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
        this.teclado.action.push(line);  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        this.tecladoReplicant.teclas[this.tecladoReplicant.teclas.length] = lineReplicant;
        this.tecladoReplicant.text[this.tecladoReplicant.text.length] = lineReplicant; 
        this.tecladoReplicant.action[this.tecladoReplicant.action.length] = lineReplicant;  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        
    }  
    
    public removeLine(){
      if(this.teclado.teclas.length > 5){
          this.teclado.teclas.pop();
          this.teclado.text.pop();
          this.teclado.action.pop();   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
      this.tecladoReplicant.teclas.pop();
          this.tecladoReplicant.text.pop(); 
          this.tecladoReplicant.action.pop();  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
      } else {
        this.messageService.error("O mínimo de linhas no modo edição é 5.");
    }  
    }  



    public editCaptionNText(event){
        
        
        this.showModal(CaptionTextModalComponent);
        
      
        let parts = event.target.className.split(' ');

        let text;
        let action;
        if(parts[0].indexOf('#') !== -1){
          let x = <number>parts[0].split('#')[0];
          let y = <number>parts[0].split('#')[1];

          text = this.tecladoReplicant.text[y][x];
          action = this.tecladoReplicant.action[y][x];
    
        } else {
          let x = <number>parts[1].split('#')[0];
          let y = <number>parts[1].split('#')[1];

          text = this.tecladoReplicant.text[y][x];
          action = this.tecladoReplicant.action[y][x];
    
        }

        let payload = new Array();
        payload.push(event);
        payload.push(text);
        payload.push(action);


        this.captionTextService.emitCaptionText(payload);

        this.payloadSubscription = this.layoutEditorService.subscribeToLayoutEditorPayloadSubject().subscribe((result)=>{


              let buttonText = "";
              buttonText = result[0];
              let buttonCaption = "";
              buttonCaption = result[1];

              let buttonAction = "";
              buttonAction = result[2];

              if(buttonText === undefined) buttonText = " ";
              if(buttonCaption === undefined) buttonCaption = " ";
              if(buttonAction === undefined || buttonAction === "") buttonAction = "Keyboard";

          
              
              let parts = event.target.className.split(' ');
 
            
      
              if(parts[0].indexOf('#') !== -1){
     
                let x = <number>parts[0].split('#')[0];
                let y = <number>parts[0].split('#')[1];
                

                
                let formula = this.globColumnQnty*Number(y)+Number(x);
     
                let sEl = $("[id=copy]").clone();

 
                let el = sEl[<number>formula].cloneNode(true);

  
                if($(el).find('input')[0]){
       
                  $(el).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                  $($(el).find('input')[0]).attr('value', buttonCaption);
                } else if($(el).find('button')[0]){
 
                  $(el).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + x + '#' + y + '';
                  
                  if($($(el).find('button')[0]).find('mat-icon')[0]) $($(el).find('button')[0]).find('mat-icon')[0].remove();
                  $($(el).find('button')[0]).text(buttonCaption);
                  $($(el).find('button')[0]).attr('value', buttonCaption);
                  
                }
                

                this.tecladoReplicant.action[y][x] = buttonAction;
                this.tecladoReplicant.teclas[y][x] = buttonCaption;
                this.tecladoReplicant.text[y][x] = buttonText;

                $(el).removeAttr('tooltip');
                
               
                $("[id=content]")[formula].appendChild(el);
  

              } else {
                //console.clear();


                let x = parts[1].split('#')[0];
                let y = parts[1].split('#')[1];


    
                let tecla = $($(event.target)[0]).val().toString();
   
                if(tecla === '*bckspc' || tecla === '*tab' || tecla === '*kbdrtrn' || tecla === 'PULA'
                    || tecla === '*arrowleft' || tecla === '*arrowright' || tecla === '*arrowup'
                    || tecla === '*arrowdown' || tecla === '*space' || tecla === "" ) {

                  this.messageService.error("Não é possível alterar teclas especiais.");
                  this.payloadSubscription.unsubscribe();
                  return;
                }
              

                $($(event.target)[0]).attr('value', buttonCaption);

                this.tecladoReplicant.teclas[y][x] = buttonCaption;
                this.tecladoReplicant.text[y][x] = buttonText;
                this.tecladoReplicant.action[y][x] = buttonAction;


                console.log(JSON.stringify(this.tecladoReplicant));
              }

              this.payloadSubscription.unsubscribe();
        })


      }
      
}
