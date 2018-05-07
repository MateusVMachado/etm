import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
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


///<reference path='../events/EventDispatcher.ts'/>

/**
 * The {{#crossLink "LayoutEditorComponent"}}{{/crossLink}} class is responsible to manage all keyboard layout creation process.
 *
 * @class LayoutEditorComponent
 * @extends AppBaseComponent
 * @implements OnInit, OnDestroy
 * @constructor
 **/
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
    
    private cutIndex: number;

    private keyboardContainerSize: number;

    private dragulaOnRemoveSubscription: Subscription;
    private dragulaOnDropSubscription: Subscription;

    private keyboardName: string;
    private layoutEditorServiceSubscribe: Subscription;

    public keyboardToEdit: string = 'pt-br';

    private timer: any;
    private markOfRemove: boolean = false;


    public IMAGE_TESTE = true;
    public choppedLines = new Array();
    public choppedNumber: number = 14;
    public choppedMap = new Map<number,number>();
    
    private growthFactor = 1.5;
    private growthTextFactor = 1.0;
    private ENABLE_TEXT_MODE: boolean = false;
    private textModeFactor: number = 23;
    private textModeMarginFactor: number = 3;
    public randomTextShouldBeArray: string = 'Random text'
    private once = true;
    private keysWidthSizeOriginal: number;

    private oldPositions = new Array();
    private smallerScreenSize: boolean;
    private keysRemoved: number;

    private availHeight: number;
    private availWidth: number;
    private scale: number;

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
                private backLoggerService: BackLoggerService,
                private cdr: ChangeDetectorRef) {
      super(injector);       
      this.timer = setInterval(this.newCheckRound.bind(this), 100);            
      this.imgLinesArray = [];
     

      this.availHeight = window.screen.availHeight;
      this.availWidth = window.screen.availWidth;

        if(this.availWidth < 1280){
        this.smallerScreenSize = true;
        this.keysRemoved = 2;
        this.globColumnQnty = this.globColumnQnty-this.keysRemoved;
      } else {
        this.smallerScreenSize = false;
      }           
      
      this.choppedNumber = this.globColumnQnty;

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


      this.dragulaOnRemoveSubscription = dragulaService.remove.subscribe((value)=> {
        this.onRemove(value);
      })


      this.dragulaOnDropSubscription = dragulaService.drop.subscribe((value) => {  
          this.onDrop(value);
      });


      this.createEmptyKeyboard();
      

    }

    ngAfterViewInit() {
      this.keyboardToEdit = 'pt-br';
    }

    ngOnDestroy() {
      this.dragulaOnDropSubscription.unsubscribe();
      this.dragulaOnRemoveSubscription.unsubscribe();
      this.dragulaService.destroy('master-bag'); 
      this.reStartBoard();
      this.timeInterval.outTime = moment().format('HH:mm:ss');
      this.userSession.layoutEditorIntervals.push(this.timeInterval);
      this.backLoggerService.sendLayoutIntervalNow(this.userSession).subscribe(()=>{   });
      clearInterval(this.timer); 
      //SEND USER SESSION TO BACKEND 
    }

    ngOnInit() {

      this.keyboardContainerSize = $(document.getElementsByClassName('teclado-container-editor')).width();
      
      this.keysWidthSize = (this.keyboardContainerSize - (this.globColumnQnty*5.5) )/this.globColumnQnty;
      
      //PARA IMAGENS MAIORES
      if(this.IMAGE_TESTE) {
        let adjustValue = 300;
        this.scale = this.availWidth/ (1920 + adjustValue);
        
        this.growthFactor = 2;
        this.keysWidthSizeOriginal = this.keysWidthSize;
        this.keysWidthSize = this.keysWidthSize * this.growthFactor;
      }  

      let self = this;

      
      $('#newKeyboard').on('click', function(){
        self.imgLinesArray = [];
        self.newKeyboard = true;
        self.editMode = false;
        
        for(let line = 0; line < self.teclado.teclas.length; line++){
          for(let col = 0; col < self.teclado.teclas[line].length; col ++){
            if(self.tecladoReplicant.teclas[line][col].split('$')[0] === '*img'){
                self.changeLineSize(line, 'default');  
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
               self.tecladoReplicant.image[i][j] = "";   
            }
        }

        // CHANGE SIZE OF ALL ROWS FOR NORMALIZING
        let sElContent = $("[id=content]");
        for(let x = 0; x < self.tecladoReplicant.teclas.length; x++){
          for(let y=0; y< self.tecladoReplicant.teclas[x].length; y++){
            let formula = self.globColumnQnty*Number(x)+Number(y);
            if(!self.imgLinesArray.includes(x) ){
                  if(self.smallerScreenSize){
                    $($(sElContent)[formula]).css('width', self.keysWidthSizeOriginal-15);
                  } else {
                    $($(sElContent)[formula]).css('width', self.keysWidthSizeOriginal);
                  }
                    
            }      
          }
        }

        self.growthTextFactor = 1.0;
        self.imgLinesArray = [];

      });

    }

 /**
 * For each dragula unit that contains text, resizes by the mangnify amount
 *
 * @method alterFontSize 
 * @param void {void} 
 * @returns void {void}
 * @public
 */
  public alterFontSize(){
    let sElContent = $('[id=content]');
    for(let unit = 0; unit < sElContent.length; unit++){
      $($(sElContent)[unit]).css('font-size',  18*this.growthTextFactor);
    }
  }

   /**
 * Generates a random color in string format representing an hexadecimal
 *
 * @method getRandomColor
 * @param void {void} 
 * @returns {string}
 * @public
 */
  public getRandomColor() {
      let letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

   /**
 * Detect changes in angular internal states
 *
 * @method newCheckRound
 * @param void {void} 
 * @returns void {void}
 * @public
 */
    private newCheckRound(){
      this.cdr.detectChanges();
  }

   /**
 * Remove all dragula units and clear the replicant 
 *
 * @method reStartBoard
 * @param void {void} 
 * @returns {void}
 * @public
 */
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
            this.tecladoReplicant.image[i][j] = "";   
          }
      }

    }


        /////////////////////////////
     ///////////////////////////////////////////////////////
    // LOAD DO TECLADO VIA COPY DOS ELEMENTOS DO DRAGULA //
   ///////////////////////////////////////////////////////
    ////////////////////////////

   /**
 * This method is rensponsable for loading all dragula units in its proper locations. It loads the specific keyboard choosed by the user, using the 'nameString' param to 
 * locate it in the database. Using the returned array it maps all keys in the matrix and clone the dragula's units and append it in the appropriate locations.
 *
 * @method updateReplicant
 * @param nameString {string}  
 * @returns void {void}
 * @public
 */
    public updateReplicant(nameString: string){
      
      
      this.newKeyboard = false;
      this.editMode = true;
      let replicantFromDatabase = new TecladoModel();

      let quantity = Math.floor(this.keyboardContainerSize / this.keysWidthSize)
      if(this.smallerScreenSize){
        this.choppedNumber = quantity-this.keysRemoved; 
      } else {
        this.choppedNumber = quantity;
      }


      let user = this.authService.getLocalUser();
      
        this.tecladoService.loadSingleKeyboard(nameString, user.email, user.jwt).subscribe(async (data)=>{  
        
      this.convertLayoutToKeyboard(replicantFromDatabase, data[0]);

          if(replicantFromDatabase.magnify !== undefined ||  replicantFromDatabase.magnify !== null){
            this.growthTextFactor = Number(replicantFromDatabase.magnify);
            if(this.growthTextFactor === 0.0) this.growthTextFactor = 1.0;
          } else {
            this.growthTextFactor = Number(1.0.toFixed(2));
          }
          

      this.imgLinesArray = [];

      let counter = 0;

      let drake = dragula({});

      let totalLength = 0;

      this.masterKeys.teclas.forEach(element => {
        element.forEach(element => {
            totalLength += 1;
        });
      });


      let elem2;
      elem2 = $("[id=copy]")[1].cloneNode(true);
      


      //reset
      for(let line = 0; line < this.teclado.teclas.length; line++){
        for(let col = 0; col < this.teclado.teclas[line].length; col ++){
          if(this.tecladoReplicant.teclas[line][col].split('$')[0] === '*img'){

              this.changeLineSize(line, 'default');  
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
          this.tecladoReplicant.image[i][j] = "";   
        }
      }

      for(let i = 0 ; i< replicantFromDatabase.teclas.length; i++){
        for( let j = 0 ; j < replicantFromDatabase.teclas[i].length; j++){
          this.tecladoReplicant.teclas[i][j] = replicantFromDatabase.teclas[i][j];
          this.tecladoReplicant.text[i][j] = replicantFromDatabase.text[i][j];
          this.tecladoReplicant.action[i][j] = replicantFromDatabase.action[i][j]; 
          this.tecladoReplicant.image[i][j] = replicantFromDatabase.image[i][j];  
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
              this.tecladoReplicant.image[x][y] = replicantFromDatabase.image[x][y]; 
              
              if(this.tecladoReplicant.teclas[x][y].substring(0,1) === '*' && this.tecladoReplicant.teclas[x][y].split('$')[0] !== '*img'){
                for(let j=0; j < specialKeys.length; j++){
                  if(specialKeys[j][0] === this.tecladoReplicant.teclas[x][y] ){
                    el1 = sEl[specialKeys[j][1]].cloneNode(true);
                  }
                }
                
              } else {
                let formula = this.globColumnQnty*Number(x)+Number(y);
                
                el1 = sEl[0].cloneNode(true);
                
              }
              
        
                      if(!$(el1).find('input')[0]){
        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] !== '*img') {
                          $($(el1).find('button')[0]).attr('value', replicantFromDatabase.teclas[x][y]);
              
                        }  

                        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] === '*img'){
                          if(!this.imgLinesArray.includes(x.toString())) this.imgLinesArray.push( Number(x) );

                          let height = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[0];
                          let width = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[1];
                          this.imgMaxHeightSize = height;
                          this.imgMaxWidthSize = width;

                          this.changeDragulaBackground( $($(el1)), replicantFromDatabase.image[x][y], height, width, 100, 100);
                   
                          $($(el1).find('button')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
             
                          $($(el1).find('button')[0]).attr('display', 'none');
                            if(this.checkLineHasImage(x)){
  
                              this.changeLineSize(x, 'imgSize');
                            }
                        }
                        
                        
                      }  else {
                        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] !== '*img') {
                            $($(el1).find('input')[0]).attr('value', replicantFromDatabase.teclas[x][y]);

                        }    
                        


                        if(replicantFromDatabase.teclas[x][y].split('$')[0] === '*img'){
                          if(!this.imgLinesArray.includes(x.toString())) this.imgLinesArray.push( Number(x) );

                          let height = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[0];
                          let width = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[1];
                          this.imgMaxHeightSize = height;
                          this.imgMaxWidthSize = width;

                          this.changeDragulaBackground( $(el1), replicantFromDatabase.image[x][y], height, width, 100, 100);

                          $($(el1).find('input')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');

                          $($(el1).find('input')[0]).attr('display', 'none');

                          if(this.checkLineHasImage(x)){
  
                            this.changeLineSize(x, 'imgSize');
                          }
                          


                        }

                      }
            

                      $(el1).removeAttr('tooltip');
                    

                     let formula = (this.globColumnQnty*x)+(y);

                    
                      $("[id=content]")[formula].appendChild(el1);

                      continue;
                    } 

                    //////
                    // ADJUST HEIGHT SIZE BASED ON KEY TYPE

                    let sElContent = $('[id=content]');

                    for(let cm = 0; cm < coordinatesMap.length; cm++ ){
                      let x = coordinatesMap[cm][1];
                      let y = coordinatesMap[cm][2];
                      

                      let formula = this.globColumnQnty*Number(x)+Number(y);
                      el1 = sElContent[formula];

                      if(replicantFromDatabase.teclas[x][y].split('$')[0] !== '*img' && this.imgLinesArray.includes(x) ) {
                        if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                        if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                            if(!$(el1).find('input')[0]){
                                  $($(el1).find('button')[0]).css('height', this.imgMaxHeightSize*this.scale);                                
                            } else {
                                  $($(el1).find('input')[0]).css('height', this.imgMaxHeightSize*this.scale);                                
                            }  

                      }

                    }  
                      
                   
        
                    let sElContentUpdate = $('[id=content]');
                    for(let unit = 0; unit < sElContentUpdate.length; unit++){
                      $($(sElContentUpdate)[unit]).css('font-size',  18*replicantFromDatabase.magnify);
                    }
                    
                    this.alterFontSize();


       })
       


    }
  

    
        /////////////////////////////
     ////////////////////////
    // FUNÇÃO AUXILIAR    //
   ////////////////////////
    ////////////////////////////

   /**
 * This method receives a 'OpenFACLayout' object (layout) and converts it to a 'TecladoModel' populating a keyboard object passed as parameter.
 *
 * @method convertLayoutToKeyboard
 * @param keyboard {TecladoModel}
 * @param layout {OpenFACLayout}
 * @returns {void}
 * @public
 */
    private convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){
      if(!layout) return;
      keyboard.teclas = [];
      keyboard.text = [];
      keyboard.action = [];  
      keyboard.image = [];  

      for(let i = 0; i < layout.Lines.length; i++){ 
        let line = []; 
        let textL = [];
        let actionL = [];
        let imageL = []; 
        for(let j = 0; j < layout.Lines[i].Buttons.length; j++){ 
          line.push(layout.Lines[i].Buttons[j].Caption); 
          textL.push(layout.Lines[i].Buttons[j].Text); 
          actionL.push(layout.Lines[i].Buttons[j].Action); 
          imageL.push(layout.Lines[i].Buttons[j].Image);  
        } 
        keyboard.teclas.push(line); 
        keyboard.text.push(textL); 
        keyboard.action.push(actionL); 
        keyboard.image.push(imageL);  
      } 

      keyboard.type = layout.nameLayout;
      keyboard.magnify = layout.magnify;

  }

    
        /////////////////////////////
     //////////////////////////////
    // EVENTO REMOVE DO DRAGULA //
   //////////////////////////////
    ////////////////////////////

   /**
 * This method handles all the aftercomes of the dragula remove event. Rearranges all matrix affected positions. 
 *
 * @method onRemove
 * @param value {any} Value passed by the dragula event that captures the element being removed
 * @returns void {void}
 * @public
 */
    private onRemove(value){
      let DEBUG = false;

      if(DEBUG) console.clear();
      if(DEBUG) console.log("-------------------REMOVE2---------------------")

      if(DEBUG) console.log("MARK1");
        let drainX, drainY, drainParts, sourceX, sourceY, sourceParts, index = -1, found;
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
      this.tecladoReplicant.image[sourceY][sourceX] = "";  

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

                }
              }
              if(DEBUG) console.log(found);
              if(DEBUG) console.log(this.count);
              
              if(!found || this.count >= 1){
                if(DEBUG) console.log("MARK5");
                
                  if(DEBUG) console.log('SOURCE: ' + sourceY);
                  if(DEBUG) console.log("ANTES DO CORTE:")
                  if(DEBUG) console.log(JSON.stringify(this.imgLinesArray))


                  for(let i = 0; i < this.imgLinesArray.length; i++){
                    if(DEBUG) console.log("imgLine[" + i + "]: " + this.imgLinesArray[i] + ' sourceY: ' + sourceY);
                    if(this.imgLinesArray[i].toString() === sourceY.toString()){
                      if(DEBUG) console.log("MARK6");
                      if(DEBUG) console.log("imgLine: " + this.imgLinesArray + ' sourceY: ' + sourceY);
                      index = i;
                      break;
                    }
                

                }
                if(index !== -1) this.imgLinesArray.splice(index, 1);
              }
              
              if(DEBUG) console.log("MARK7");
              found = false;

      }        

      if(isImage){
          if(!this.checkLineHasImage(sourceY)){
            this.changeLineSize(sourceY, 'default');
          }
      }
      

 
      if(!this.checkLineHasImage(sourceY) ){

            this.changeLineSize(sourceY, 'default');
            let sElContentTmp = $('[id=content]');
            for(let step = 0 ; step < 14; step++){
              
              let formula = this.globColumnQnty*Number(sourceY)+Number(step);
          
          
              if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.keysHeightSize);
              } else {
                $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.keysHeightSize);
              }
              if( $($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0] ){
                $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.keysHeightSize);
              } else {
                $($($($(sElContentTmp)[formula]).find('div')[1]).find('button')[0]).css('height', this.keysHeightSize);
              }
      
            }
      }
 
      if(DEBUG) console.log(JSON.stringify(this.imgLinesArray) )
      if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.teclas))
      if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.action))
      if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.text))
      


    }  



    
        /////////////////////////////
     ////////////////////////////
    // EVENTO DROP DO DRAGULA //
   ////////////////////////////
    ////////////////////////////

  /**
 * This method handles all the aftercomes of the dragula drop event. Rearranges all matrix affected positions and relocates dragula units. Resize lines if dropped element
 * is a picture and resize lines that had, but no longer have a picture in it´.
 * 
 * @method onDrop
 * @param value {any} Value passed by the dragula event that captures the element being dropped
 * @returns void {void}
 * @public
 */
    private onDrop(value) {
      let DEBUG = false;
      let DEBUG2 = false;

      if(DEBUG) console.log("-------------------DROPS---------------------")
      if(DEBUG2) console.log("-------------------DROPS---------------------")
      if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.teclas));


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


          let numberOfImages = 0;
          for(let unit = 0; unit < this.tecladoReplicant.teclas[drainY].lenght; unit++){
            if(this.tecladoReplicant.teclas[drainY][unit].split('$')[0] === '*img'){
              numberOfImages += 1;
            }
          }


            for(let i = 0; i < this.imgLinesArray.length; i++){
              if(this.imgLinesArray[i].toString() === sourceY.toString()){
                if(DEBUG) console.log("MARK-DROP-8");
                this.cutIndex = i;
     
                break;
              }
            }
     

            if(DEBUG) console.log("MARK-NEWDROP-1");
  
            
         
            if(DEBUG2) console.log("imgLINES ANTES DO CORTE:")
            if(DEBUG2) console.log(JSON.stringify(this.imgLinesArray))

    
         
            if(DEBUG) console.log("VALUE")
            if(DEBUG) console.log(value[3])
            if(DEBUG) console.log('ID: ' + value[3].id)
            if(this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] === '*img' && sourceY !== drainY && value[3].id !== 'copy'){
              this.imgLinesArray.splice(this.cutIndex, 1);
            }

            if(DEBUG2) console.log("imgLINES DEPOIS DO CORTE:")
            if(DEBUG2) console.log(JSON.stringify(this.imgLinesArray))

          if(DEBUG) console.log("MARK-NEWDROP-1A");


          if(this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] === '*img' && drainY !== sourceY ){


            if(DEBUG) console.log("MARK-NEWDROP-9");
              

            let derivedX = drainX;

            if(this.choppedNumber !== this.globColumnQnty){
              if(DEBUG) console.log("MARK-NEWDROP-10");
              let found = false;
              for(let unit = 0; unit < this.imgLinesArray.length; unit++){
                if(this.imgLinesArray[unit].toString() === drainY.toString()){
                  found = true;
                  break;
                }
              }


                    if(!found){
                      if(DEBUG) console.log("MARK-NEWDROP-11");
                        let sElContentTmp = $('[id=content]');
                        let el = $(value[1])[0].cloneNode(true);
                        $(value[1])[0].remove();
  
                        
                        derivedX = this.mapToNewFormula(drainX, drainY, this.choppedNumber,false);//
                      
                        let formula = this.globColumnQnty*Number(drainY)+Number(derivedX);
 
                        drainX = derivedX;

                        if(this.tecladoReplicant.teclas[drainY][derivedX] !== ''){
                          formula = this.globColumnQnty*Number(drainY)+Number(derivedX);
                          if($($("[id=content]")[formula]).find('input')[0]){
                            $($("[id=content]")[formula]).find('input')[0].remove(); 
                          }
                          if($($("[id=content]")[formula]).find('button')[0]){
                            $($("[id=content]")[formula]).find('button')[0].remove();
                          }
                        }

                        formula = this.globColumnQnty*Number(drainY)+Number(derivedX);
                        sElContentTmp[formula].appendChild(el);
                        
                  }     
        
            }

            drainX = derivedX
            if(value[3].id !== 'copy') this.imgLinesArray.push(Number(drainY)) ;


            if(DEBUG2) console.log("imgLINES DEPOIS DO PUSH:")
            if(DEBUG2) console.log(JSON.stringify(this.imgLinesArray))

              let choice = false;
  

              if( !this.checkLineHasImage(drainY) ) {
                if(DEBUG) console.log("MARK-NEWDROP-12");

                  this.changeLineSize(drainY, 'imgSize');
                      let sElContentTmp = $('[id=content]');
                      for(let step = 0 ; step < this.globColumnQnty; step++){
                        
                        let formula = this.globColumnQnty*Number(drainY)+Number(step);
              
                        if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                        if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                        if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                          if(this.ENABLE_TEXT_MODE){
                            $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                          } else {
                            $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize);
                          }
                          
                        } else {
                          if(this.ENABLE_TEXT_MODE){
                            $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                          } else {
                            $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize);
                          }
                          
                        }
                
                      }
              }        

  
              if(this.checkLineHasImage(sourceY) ){
                if(DEBUG) console.log("MARK-NEWDROP-13");
                
                this.changeLineSize(sourceY, 'default');
                let sElContentTmp = $('[id=content]');
                for(let step = 0 ; step < this.globColumnQnty; step++){

                  let formula = this.globColumnQnty*Number(sourceY)+Number(step);

                  if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                    $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.keysHeightSize);
                  } else {
                    $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.keysHeightSize);
                  }
      
                }
              } 
            

              if(!this.checkLineHasImage(sourceY) ){
                if(DEBUG) console.log("MARK-NEWDROP-14");

                this.changeLineSize(sourceY, 'default');
                let sElContentTmp = $('[id=content]');
                for(let step = 0 ; step < this.globColumnQnty; step++){

                  let formula = this.globColumnQnty*Number(sourceY)+Number(step);
                  
                  if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                    $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.keysHeightSize);
                  } else {
                    $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.keysHeightSize);
                  }
      
                }
              } 


            } 
            

            if( !this.checkLineHasImage(drainY) ) {
              if(DEBUG) console.log("MARK-NEWDROP-15");

              if(isContent) {
                 $($(value[1])[0]).find('input').css('height', this.keysHeightSize);
              } else {
                $($(value[1])[0]).find('input').css('height', this.imgMaxHeightSize);
              }   
            }

            if( this.checkLineHasImage(drainY) ) {
              if(DEBUG) console.log("MARK-NEWDROP-16");
              if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
              if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
              if(isContent){
                if(this.ENABLE_TEXT_MODE){
                  $($(value[1])[0]).find('input').css('height', this.imgMaxHeightSize + this.textModeFactor);
                } else {
                  $($(value[1])[0]).find('input').css('height', this.imgMaxHeightSize);
                }
                
              } 
              let sElContentTmp = $('[id=content]');
              
              for(let line = 0 ; line < this.imgLinesArray.length; line++){
                  for(let step = 0 ; step < this.globColumnQnty; step++){
                    
                    let formula = this.globColumnQnty*Number(this.imgLinesArray[line])+Number(step);
                    
                    if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                      if(DEBUG) console.log("MARK-NEWDROP-17");
                      if(this.ENABLE_TEXT_MODE){
                        $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);    
                      } else {
                        $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize);
                      }
                      
                    } else {
                      if(this.ENABLE_TEXT_MODE){
                        $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                      } else {
                        $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize);
                      }
                      
                    }
                  }
              }    

            }

            if( this.checkLineHasImage(sourceY) ) {
              if(DEBUG) console.log("MARK-NEWDROP-18");

              if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
              if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
              if(isContent) $($(value[1])[0]).find('input').css('height', this.imgMaxHeightSize);
              let sElContentTmp = $('[id=content]');
              
              for(let line = 0 ; line < this.imgLinesArray.length; line++){
                  for(let step = 0 ; step < this.globColumnQnty; step++){
                    
                    let formula = this.globColumnQnty*Number(this.imgLinesArray[line])+Number(step);
   
  

                    if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                      if(this.ENABLE_TEXT_MODE){
                        $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                      } else {
                        $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize);
                      }
                      
                    } else {
                      if(this.ENABLE_TEXT_MODE){
                        $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                      } else {
                        $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize);
                      }
                    }
                  }
              }    

            }



   
                let trueValue, copyObj, objClass, trueObj, toSource;

                if($(value).find('button')){
                  if(DEBUG) console.log("MARK-NEWDROP-19");
                  
                  this.lastKind = $(value[1])[0].id ; 
                  trueValue = $($(value[1])[0]).val() ;
                  
                  if(!this.editMode){
                    if(DEBUG) console.log("MARK-NEWDROP-20");
                          if($(value[2]).children().length > 2 ) {   
              
                            if(DEBUG) console.log("MARK-DROP-9");

                            value[1].remove();  
                            trueValue = $($(value[1])[0]).val() ;
                            
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                            this.tecladoReplicant.action[sourceY][sourceX] = "";  
                            this.tecladoReplicant.image[sourceY][sourceX] = "";  
                          } else {
                            trueValue = $($(value[1])[0]).val() ;
                 
                                          
                            if(DEBUG) console.log("MARK-DROP-10");



                            if(this.tecladoReplicant.text[sourceY][sourceX]!== "" && this.tecladoReplicant.teclas[sourceY][sourceX]!== "" ){ 
                              if(isContent && !isCopy){

                                                                          
                                if(DEBUG) console.log("MARK-DROP-11");


                                  this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";

                                  this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX];
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 

                                  this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX]; 
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";
                                  
                                  this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";  
                              
                                } else if (isContent && isCopy){

                                                                            
                                  if(DEBUG) console.log("MARK-DROP-12");


                                  this.tecladoReplicant.teclas[drainY][drainX] = trueValue;

                                  this.tecladoReplicant.text[drainY][drainX] = trueValue; 

                                  this.tecladoReplicant.action[drainY][drainX] = "Keyboard";
                                  
                                  this.tecladoReplicant.image[drainY][drainX] = ""; 
                                  
                              }
                            } else {

                                                                            
                              if(DEBUG) console.log("MARK-DROP-13");

                              if(trueValue && !isCopy){
                                if(DEBUG) console.log("MARK-DROP-13A");
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                              }else if(trueValue && isCopy){
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                              
                              } else if( !isCopy){
                                if(DEBUG) console.log("MARK-DROP-13B");
                                if(DEBUG) console.log("NO SOURCE!")
                                if(DEBUG) console.log(this.tecladoReplicant.teclas[sourceY][sourceX]);
                                if(DEBUG) console.log("NOVO DRAIN:")
                                if(DEBUG) console.log('drainX: ' + drainX + ' drainY: ' + drainY)
                                this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              }
                              


                                this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                this.tecladoReplicant.text[drainY][drainX] = trueValue;
           
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  

                                if(this.tecladoReplicant.image[sourceY][sourceX] !== "" && !isCopy){
                                  if(DEBUG) console.log("MARK-DROP-13C");
                                  this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   
                                } else {
                                  if(DEBUG) console.log("MARK-DROP-13D");
                                  
                                }
              

                                if(trueValue === "*mic"){
                                  this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                } else {

                                
                                this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  

                                }
                            }    
                            
                          } 
     
                          let coord = $(value[1])[0].className.split(' ');
                          $(value[1])[0].className = drainX + '#' + drainY + ' ' + coord[1];

                          if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                          if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                          if(this.checkLineHasImage(drainY)){
                            $($(value[1])[0]).css('height', this.imgMaxHeightSize);
                          } else {
                            $($(value[1])[0]).css('height', this.keysHeightSize);
                          }
                          
                          
                 
                  } else {
                          if($(value[2]).children().length > 1 ) {   

                                                                                                        
                            if(DEBUG) console.log("MARK-DROP-14");


                            value[1].remove();  
                            trueValue = $($(value[1])[0]).val() ;
                            this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                            this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                            this.tecladoReplicant.action[sourceY][sourceX] = "";
                            
                            this.tecladoReplicant.image[sourceY][sourceX] = ""; 
                          } else {
       
                                                                            
                            if(DEBUG) console.log("MARK-DROP-14");


                            if($(value[1]).find('input')[0]){
                              trueValue = $($(value[1]).find('input')[0]).val();
                            } else if($(value[1]).find('button')[0]){
                              trueValue = $($(value[1]).find('button')[0]).val();
                            }
 

                 
                            if(this.tecladoReplicant.text[sourceY][sourceX]!== ""  && this.tecladoReplicant.teclas[sourceY][sourceX]!== ""){
  
                      
                                  if(isContent && !isCopy){
      
                                                                                                                
                                    if(DEBUG) console.log("MARK-DROP-15A");


                                    this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX]; 
                                    this.tecladoReplicant.teclas[sourceY][sourceX] = ""; 
                                  
                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 

                                    this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX]; 
                                    this.tecladoReplicant.action[sourceY][sourceX] = "";
                                    
                                    
                                    this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  
                                    this.tecladoReplicant.image[sourceY][sourceX] = "";


                                } else if (isContent && isCopy){
            
                                                                                         
                                  if(DEBUG)  console.log("MARK-DROP-15B");

                                  
                                    this.tecladoReplicant.teclas[drainY][drainX] = trueValue;  

                                    
                                    this.tecladoReplicant.text[drainY][drainX] = trueValue; 
                                    
                                    if(trueValue === "*mic"){
                                      this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                    } else {

                                      this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  

                                    }

                                    this.tecladoReplicant.image[drainY][drainX] = "";  

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
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   
                                } else {
                                  if(DEBUG)  console.log("MARK-DROP-16-D");
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   
                                }
                                 
                                  if(trueValue === "*mic"){
                                    this.tecladoReplicant.action[drainY][drainX] = 'TTS';  
                                  } else {

                                    this.tecladoReplicant.action[drainY][drainX] = 'Keyboard';  

                                  }
                              }    

       
                          } 
               
                          let coord = $(value[1])[0].className.split(' ');
                          $(value[1])[0].className = drainX + '#' + drainY + ' ' + coord[1];
                          if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                          if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                          if(this.checkLineHasImage(drainY)){
                            $($(value[1])[0]).css('height', this.imgMaxHeightSize);  
                          } else {
                            $($(value[1])[0]).css('height', this.keysHeightSize);
                          }
                          

                          if($($(value[1])[0]).find('input')[0]){ 
                                  $($($(value[1])[0]).find('input')[0]).css('class', 'tamanho-button-especial-big' + ' ' + drainX + '#' + drainY + '');
       
                          }          
        
                  }   

    

                  if(!this.checkLineHasImage(sourceY)){
      
                    this.changeLineSize(sourceY, 'default');
                  } else {
                    this.changeLineSize(sourceY, 'imgSize');
                  }

                  if(!this.checkLineHasImage(drainY)){

                      this.changeLineSize(drainY, 'default');
                    } else {
                      this.changeLineSize(drainY, 'imgSize');
                    }

 
                    this.adjustLinesSizes(drainY, drainX, sourceY, sourceX);
                  

                    // CHANGE SIZE OF ALL ROWS FOR NORMALIZING
                    if(DEBUG) console.log("imgLines ANTES DE NORMALIZAR: ")
                    if(DEBUG) console.log(JSON.stringify(this.imgLinesArray))

                    let sElContent = $("[id=content]");
                    for(let x = 0; x < this.tecladoReplicant.teclas.length; x++){
                      for(let y=0; y< this.tecladoReplicant.teclas[x].length; y++){
                        let formula = this.globColumnQnty*Number(x)+Number(y);
                        if(!this.imgLinesArray.includes(x) ){
                            if(this.smallerScreenSize){
                              $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal-15); 
                            } else {
                              $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal);
                            }   
                        }     
                      }
                    } 



                    let found = false;
                    for(let x = 0 ; x < this.imgLinesArray.length; x++){
                      if(this.imgLinesArray[x].toString() === drainY.toString()){
                        found = true;
                        break;
                      }
                    }

                    let isImage = true;
                    let checagem = false;

                    let imageTransfer = false;
                    if(this.checkLineHasImage(drainY) && this.tecladoReplicant.teclas[sourceY][sourceX] === '') imageTransfer = true;
                
                    if($($(value[1])[0].attributes)[4]){
                      if($($(value[1])[0].attributes)[4].textContent.substring(0,10) === 'background'){
                        checagem = true; 
                        isImage = true;
                        imageTransfer = true;
                      } else {
                        isImage = false;
                        imageTransfer = false;
                      }
                    }  


                      let ignoreTransfer = false;
                      if(imageTransfer && drainY === sourceY) ignoreTransfer = true;

                      if(DEBUG) console.log("**********UPPER***********")
                      if(DEBUG) console.log('!this.checkLineHasImage(drainY): ' + !this.checkLineHasImage(drainY) + ' \nisImage: ' + isImage + 
                      ' \nimageTransfer: ' + imageTransfer + ' \nignoreTransfer: ' + ignoreTransfer)

                      
                      //if(!this.checkLineHasImage(drainY) && isImage){
                        let self = this;
                      if(imageTransfer && isImage && !ignoreTransfer){

 
                          if(DEBUG) console.log("MODO REALOCAÇÃO IMINENTE2!");


                        if(DEBUG) console.log(this.choppedNumber)
    
                        // REMOVE EXTRA KEYS
                  
                
                    let line = drainY;
                    for(let col = 0; col < this.tecladoReplicant.teclas[line].length; col++){
  
                      if(DEBUG) console.log(this.choppedNumber)
                      if(col >= this.choppedNumber && this.tecladoReplicant.teclas[line][col] !== ''){
                        if(DEBUG) console.log("ENCONTROU ELEMENTO ALÉM DO LIMIAR: " + this.tecladoReplicant.teclas[line][col]);
                        let newformula = this.globColumnQnty*Number(line)+Number(col);
                        if($($('[id=content]')[newformula]).find('input')[0]){
                          $($('[id=content]')[newformula]).find('input')[0].remove();
                        }
                        if($($('[id=content]')[newformula]).find('button')[0]){
                          $($('[id=content]')[newformula]).find('button')[0].remove();
                        }
                        this.tecladoReplicant.teclas[line][col] = '';
                        this.tecladoReplicant.action[line][col] = '';
                        this.tecladoReplicant.text[line][col] = '';
                        this.tecladoReplicant.image[line][col] = '';

                      }
                    }
            



                        if(sourceY !== drainY){
          
                                let line = drainY
                                for(let col = 0; col < this.tecladoReplicant.teclas[line].length; col++){
                   
                                  if(col >= this.choppedNumber && this.tecladoReplicant.teclas[line][col]!== '' ){
                                    if(DEBUG) console.log("Encontrado elemento além do limiar: " + this.tecladoReplicant.teclas[line][col]);
                                    let formula = this.globColumnQnty*Number(line)+Number(col);
                                    let clone;
                                    if($(sElContent[formula]).find('input')[0]) {
                                        clone = $(sElContent[formula]).find('input')[0].cloneNode(true);
                                        $(sElContent[formula]).find('input')[0].remove();
                                    }    
                                    if($(sElContent[formula]).find('button')[0]) {
                                        clone = $(sElContent[formula]).find('button')[0].cloneNode(true);
                                        $(sElContent[formula]).find('button')[0].remove();
                                    } 
                                    if(DEBUG) console.log(clone);

                                    for(let x = col ; x > 0; x--){
                                      if(this.tecladoReplicant.teclas[line][x] === '' && x < this.choppedNumber && col !== drainY){
                                        if(DEBUG) console.log('Encontrada lacuna em branco em: ' + x);
                                        formula  = this.globColumnQnty*Number(line)+Number(x);
                                        this.tecladoReplicant.teclas[line][x] = this.tecladoReplicant.teclas[line][col];
                                        this.tecladoReplicant.action[line][x] = this.tecladoReplicant.action[line][col];
                                        this.tecladoReplicant.text[line][x] = this.tecladoReplicant.text[line][col];
                                        this.tecladoReplicant.image[line][x] = this.tecladoReplicant.image[line][col];
                                        $(sElContent[formula]).attr('class', '@copyArea$' + ' ' + x + '#' + line + '');
                                        sElContent[formula].appendChild(clone);
                                        break;
                                      }
                                    }

                                    this.tecladoReplicant.teclas[line][col] = '';
                                    this.tecladoReplicant.action[line][col] = '';
                                    this.tecladoReplicant.text[line][col] = '';
                                    this.tecladoReplicant.image[line][col] = '';


                                  }
                                }
                                
                        
                          } 

 
  
                      }
              
                      
                            
                      if(DEBUG) console.log(JSON.stringify(this.imgLinesArray))

                      if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.teclas))
                      if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.action))
                      if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.text))

                    
                  return;
                }

                if(value[3].id === "copy"){
                  
                  this.lastKind = value[3].id ; 

                                                                            
                  if(DEBUG) console.log("MARK-DROP-17");


      
                    trueValue = $($(value[3]).find('input')[0]).val();
                    copyObj = $(value[3]).find('input')[0];
                    objClass = $(value[3]).find('input')[0].className;
      
                    
                    if($(value[2]).children().length > 2 ) {   
      
                        value[1].remove();  
                        trueValue = $($(value[1])[0]).val();

                                                                            
                        if(DEBUG) console.log("MARK-DROP-18");


                        this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                        this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                        this.tecladoReplicant.action[sourceY][sourceX] = "";  

                        this.tecladoReplicant.image[sourceY][sourceX] = "";  
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


                    if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){  
                                                                             
                      if(DEBUG) console.log("MARK-DROP-24");



                        this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   
                        this.tecladoReplicant.image[sourceY][sourceX] = "";   
                    } else {   
                                                                                                   
                      if(DEBUG)  console.log("MARK-DROP-25");


                        this.tecladoReplicant.image[sourceY][sourceX] = "";   
                    } 


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


                          
                          if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){  
                              
                            if(DEBUG) console.log("MARK-DROP-33");


                            this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   
                            this.tecladoReplicant.image[sourceY][sourceX] = "";  
                          } else {   
                              
                            if(DEBUG) console.log("MARK-DROP-34");


                            this.tecladoReplicant.image[sourceY][sourceX] = "";   
                          } 




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

                                this.tecladoReplicant.image[sourceY][sourceX] = "";    
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



                            

                            if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){ 
                               
                              if(DEBUG) console.log("MARK-DROP-42");


                              this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   
                              this.tecladoReplicant.image[sourceY][sourceX] = "";  
                          } else {  
                             
                            if(DEBUG) console.log("MARK-DROP-43");


                              this.tecladoReplicant.image[sourceY][sourceX] = "";   
                          }   


                            }    
                          } else {
                            if($(value[2]).children().length > 2) {
           
                              value[1].remove();
                              
 
                              if(DEBUG)  console.log("MARK-DROP-44");


                              
                              this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                              this.tecladoReplicant.action[sourceY][sourceX] = "";  

                              this.tecladoReplicant.image[sourceY][sourceX] = "";   
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



                            
                            if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){ 
                               
                              if(DEBUG)  console.log("MARK-DROP-50");


                              this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  
                              this.tecladoReplicant.image[sourceY][sourceX] = "";   
                          } else {  
                             
                            if(DEBUG) console.log("MARK-DROP-51");


                              this.tecladoReplicant.image[sourceY][sourceX] = "";   
                                   
                          } 


         
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

                                  this.tecladoReplicant.image[sourceY][sourceX] = "";  
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
                              

                              if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){  
                                                             
                                if(DEBUG) console.log("MARK-DROP-58");


                                this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  
                                this.tecladoReplicant.image[sourceY][sourceX] = "";   
                            } else { 
                                                           
                              if(DEBUG) console.log("MARK-DROP-59");


                                this.tecladoReplicant.image[sourceY][sourceX] = "";     
                            } 


                              }    
                            } else {
                              if($(value[2]).children().length > 2) {
       
                                  value[1].remove();
                             
                                  if(DEBUG) console.log("MARK-DROP-60");



                                  this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                  this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                  this.tecladoReplicant.action[sourceY][sourceX] = "";
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   
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



                              if(this.tecladoReplicant.image[sourceY][sourceX]!== ""){   
                                                             
                                if(DEBUG)  console.log("MARK-DROP-66");


                                this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];   
                                this.tecladoReplicant.image[sourceY][sourceX] = "";   
                            } else {  
                                                           
                              if(DEBUG) console.log("MARK-DROP-67");


                                this.tecladoReplicant.image[sourceY][sourceX] = "";   
                            } 



                              }   
                            }  

    }    
                      } 
                    } 

                    
                }    
                
                
                  if(!this.checkLineHasImage(sourceY)){

                    this.changeLineSize(sourceY, 'default');
                  } else {
                    this.changeLineSize(sourceY, 'imgSize');
                  }
              

                  this.adjustLinesSizes(drainY, drainX, sourceY, sourceX);
              
                  // CHANGE SIZE OF ALL ROWS FOR NORMALIZING
                  let sElContent = $("[id=content]");
                  for(let x = 0; x < this.tecladoReplicant.teclas.length; x++){
                    for(let y=0; y< this.tecladoReplicant.teclas[x].length; y++){
                      let formula = this.globColumnQnty*Number(x)+Number(y);
                      if(!this.imgLinesArray.includes(x) ){
                          if(this.smallerScreenSize){
                            $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal-15);
                          } else {
                            $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal);
                          }
                            
                      }      
                    }
                  }                   



                  found = false;
                  for(let x = 0 ; x < this.imgLinesArray.length; x++){
                    if(this.imgLinesArray[x].toString() === drainY.toString()){
                      found = true;
                      break;
                    }
                  }

                  let isImage = true;
                  let checagem = false;

                  let imageTransfer = false;
                  if(this.checkLineHasImage(drainY) && this.tecladoReplicant.teclas[sourceY][sourceX] === '') imageTransfer = true;
              
                  if($($(value[1])[0].attributes)[4]){
                    if($($(value[1])[0].attributes)[4].textContent.substring(0,10) === 'background'){
                      checagem = true; 
                      isImage = true;
                      imageTransfer = true;
                    } else {
                      isImage = false;
                      imageTransfer = false;
                    }
                  }  


                    let ignoreTransfer = false;
                    if(imageTransfer && drainY === sourceY) ignoreTransfer = true;

                    if(DEBUG) console.log("**********UPPER***********")
                    if(DEBUG) console.log('!this.checkLineHasImage(drainY): ' + !this.checkLineHasImage(drainY) + ' \nisImage: ' + isImage + 
                    ' \nimageTransfer: ' + imageTransfer + ' \nignoreTransfer: ' + ignoreTransfer)

                    
                      let self = this;
                    if(imageTransfer && isImage && !ignoreTransfer){

                      if(DEBUG) console.log("MODO REALOCAÇÃO IMINENTE2!");

                      if(DEBUG) console.log(this.choppedNumber)
   
                      // REMOVE EXTRA KEYS
                
                  let line = drainY;
                  for(let col = 0; col < this.tecladoReplicant.teclas[line].length; col++){
                    if(DEBUG) console.log(this.choppedNumber)
                    if(col >= this.choppedNumber && this.tecladoReplicant.teclas[line][col] !== ''){
                      if(DEBUG) console.log("ENCONTROU ELEMENTO ALÉM DO LIMIAR: " + this.tecladoReplicant.teclas[line][col]);
                      let newformula = this.globColumnQnty*Number(line)+Number(col);
                      if($($('[id=content]')[newformula]).find('input')[0]){
                        $($('[id=content]')[newformula]).find('input')[0].remove();
                      }
                      if($($('[id=content]')[newformula]).find('button')[0]){
                        $($('[id=content]')[newformula]).find('button')[0].remove();
                      }
                      this.tecladoReplicant.teclas[line][col] = '';
                      this.tecladoReplicant.action[line][col] = '';
                      this.tecladoReplicant.text[line][col] = '';
                      this.tecladoReplicant.image[line][col] = '';

                    }
                  }
          



                      if(sourceY !== drainY){
                  
                              let line = drainY
                              for(let col = 0; col < this.tecladoReplicant.teclas[line].length; col++){
                
                                if(col >= this.choppedNumber && this.tecladoReplicant.teclas[line][col]!== '' ){
                                  if(DEBUG) console.log("Encontrado elemento além do limiar: " + this.tecladoReplicant.teclas[line][col]);
                                  let formula = this.globColumnQnty*Number(line)+Number(col);
                                  let clone;
                                  if($(sElContent[formula]).find('input')[0]) {
                                      clone = $(sElContent[formula]).find('input')[0].cloneNode(true);
                                      $(sElContent[formula]).find('input')[0].remove();
                                  }    
                                  if($(sElContent[formula]).find('button')[0]) {
                                      clone = $(sElContent[formula]).find('button')[0].cloneNode(true);
                                      $(sElContent[formula]).find('button')[0].remove();
                                  } 
                                  if(DEBUG) console.log(clone);

                                  for(let x = col ; x > 0; x--){
                                    if(this.tecladoReplicant.teclas[line][x] === '' && x < this.choppedNumber && col !== drainY){
                                      if(DEBUG) console.log('Encontrada lacuna em branco em: ' + x);
                                      formula  = this.globColumnQnty*Number(line)+Number(x);
                                      this.tecladoReplicant.teclas[line][x] = this.tecladoReplicant.teclas[line][col];
                                      this.tecladoReplicant.action[line][x] = this.tecladoReplicant.action[line][col];
                                      this.tecladoReplicant.text[line][x] = this.tecladoReplicant.text[line][col];
                                      this.tecladoReplicant.image[line][x] = this.tecladoReplicant.image[line][col];
                                      sElContent[formula].appendChild(clone);
                                      break;
                                    }
                                  }

                                  this.tecladoReplicant.teclas[line][col] = '';
                                  this.tecladoReplicant.action[line][col] = '';
                                  this.tecladoReplicant.text[line][col] = '';
                                  this.tecladoReplicant.image[line][col] = '';


                                }
                              }
  
                        } 



                    }
            
    
                    
                          
                    if(DEBUG) console.log(JSON.stringify(this.imgLinesArray))

                    if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.teclas))
                    if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.action))
                    if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.text))

               
             
    }    

    
          //////////////////////////////////////////////////////////////////////////////
       //////////////////////////////////////
      ///// FAZER REMANEJAMENTO DE TECLAS //  
        ///////////////////////////////////////

        /**
       * This method receives the (x, y) coordinates from the dragula unit origin position and the dragula unit destination position. It checks if there is elements 
       * outside the desired range in the destination line and if it is, the function searchs for empty spaces in the array to append it. Otherwise the element is eliminated.
       *
       * @method relocKeys
       * @param drainX {number} x coordinate of the dragula unit destination
       * @param drainY {number} y coordinate of the dragula unit destination
       * @param sourceX {number} x coordinate of the dragula unit origin
       * @param sourceY {number} y coordinate of the dragula unit origin
       * @param value? {any} optional parameter that carries the dragula units from the drop event
       * @returns void {void}
       * @public
       */
        private relocKeys( drainX: number, drainY: number, sourceX: number, sourceY: number, value?: any){
          let DEBUG = false;

          let sElContent = $('[id=content]');

          let found = false;
          for(let x = 0 ; x < this.imgLinesArray.length; x++){
            if(this.imgLinesArray[x].toString() === drainY.toString()){
              found = true;
              break;
            }
          }

          let isImage = true;
          let checagem = false;

          let imageTransfer = false;
          if(this.checkLineHasImage(drainY) && this.tecladoReplicant.teclas[sourceY][sourceX] === '') imageTransfer = true;
      
          if($($(value[1])[0].attributes)[4]){
            if($($(value[1])[0].attributes)[4].textContent.substring(0,10) === 'background'){
              checagem = true; 
              isImage = true;
              imageTransfer = true;
            } else {
              isImage = false;
              imageTransfer = false;
            }
          }  


            let ignoreTransfer = false;
            if(imageTransfer && drainY === sourceY) ignoreTransfer = true;

            if(DEBUG) console.log("**********UPPER***********")
            if(DEBUG) console.log('!this.checkLineHasImage(drainY): ' + !this.checkLineHasImage(drainY) + ' \nisImage: ' + isImage + 
            ' \nimageTransfer: ' + imageTransfer + ' \nignoreTransfer: ' + ignoreTransfer)

            
              let self = this;
            if(imageTransfer && isImage && !ignoreTransfer){

                if(DEBUG) console.log("MODO REALOCAÇÃO IMINENTE2!");


              if(DEBUG) console.log(this.choppedNumber)

              if(sourceY !== drainY){
                    for(let line = 0; line < this.tecladoReplicant.teclas.length; line++)  {
                      for(let col = 0; col < this.tecladoReplicant.teclas[line].length; col++){
      
                        if(col >= this.choppedNumber && this.tecladoReplicant.teclas[line][col]!== '' ){
                          if(DEBUG) console.log("Encontrado elemento além do limiar: " + this.tecladoReplicant.teclas[line][col]);
                          let formula = this.globColumnQnty*Number(line)+Number(col);
                          let clone;
                          if($(sElContent[formula]).find('input')[0]) {
                              clone = $(sElContent[formula]).find('input')[0].cloneNode(true);
                              $(sElContent[formula]).find('input')[0].remove();
                          }    
                          if($(sElContent[formula]).find('button')[0]) {
                              clone = $(sElContent[formula]).find('button')[0].cloneNode(true);
                              $(sElContent[formula]).find('button')[0].remove();
                          } 
                          if(DEBUG) console.log(clone);

                          for(let x = col ; x > 0; x--){
                            if(this.tecladoReplicant.teclas[line][x] === '' && x < this.choppedNumber && col !== drainY){
                              if(DEBUG) console.log('Encontrada lacuna em branco em: ' + x);
                              formula  = this.globColumnQnty*Number(line)+Number(x);
                              this.tecladoReplicant.teclas[line][x] = this.tecladoReplicant.teclas[line][col];
                              this.tecladoReplicant.action[line][x] = this.tecladoReplicant.action[line][col];
                              this.tecladoReplicant.text[line][x] = this.tecladoReplicant.text[line][col];
                              this.tecladoReplicant.image[line][x] = this.tecladoReplicant.image[line][col];
                              sElContent[formula].appendChild(clone);
                              break;
                            }
                          }

                          this.tecladoReplicant.teclas[line][col] = '';
                          this.tecladoReplicant.action[line][col] = '';
                          this.tecladoReplicant.text[line][col] = '';
                          this.tecladoReplicant.image[line][col] = '';


                        }
                      }
                      
                   }
                } 



            }
    

                  
            if(DEBUG) console.log(JSON.stringify(this.imgLinesArray))

            if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.teclas))
            if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.action))
            if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.text))

        }



        /////////////////////////////
     //////////////////////////////////////
    // FAZ AJUSTE DO TAMANHO DAS LINHAS //
   //////////////////////////////////////
    ////////////////////////////

        /**
       * This method check if the destination line or the origin line has images. If a line receives an image and don't have already a image on it, it expands its dimensions 
       * to fit it. Otherwise if a line has images and lose all of it, the line shrinks to fit only normal keys.
       *
       * @method adjustLinesSizes
       * @param drainX {number} x coordinate of the dragula unit destination
       * @param drainY {number} y coordinate of the dragula unit destination
       * @param sourceX {number} x coordinate of the dragula unit origin
       * @param sourceY {number} y coordinate of the dragula unit origin
       * @returns void {void}
       * @public
       */
    private adjustLinesSizes(drainY: number, drainX: number, sourceY: number, sourceX: number){
 
                  if(!this.checkLineHasImage(drainY) && this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] !== '*img'){
  
                        let sElContentTmp = $('[id=content]');
                        for(let step = 0 ; step < this.globColumnQnty; step++){
                          
                          let formula = this.globColumnQnty*Number(drainY)+Number(step);
      

                          if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                            if(this.ENABLE_TEXT_MODE){
                              $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.keysHeightSize + this.textModeFactor);  
                            } else {
                              $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.keysHeightSize);
                            }
                            
                          } else {
                            if(this.ENABLE_TEXT_MODE){
                              $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.keysHeightSize + this.textModeFactor);  
                            } else {
                              $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.keysHeightSize);
                            }
                            
                          }
      
                        }
                  }

                  if(!this.checkLineHasImage(drainY) && this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img'){

                    let sElContentTmp = $('[id=content]');
                    for(let step = 0 ; step < this.globColumnQnty; step++){
                      
                      let formula = this.globColumnQnty*Number(drainY)+Number(step);

                      if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      } else {
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      }
  
                    }
              }

                  if(!this.checkLineHasImage(sourceY) ){

                    
                    this.changeLineSize(sourceY, 'default');
                    let sElContentTmp = $('[id=content]');
                    for(let step = 0 ; step < this.globColumnQnty; step++){
    
                      let formula = this.globColumnQnty*Number(sourceY)+Number(step);
            

                      if( $($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0] ){
                        $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.keysHeightSize);
                      } else {
                        $($($($(sElContentTmp)[formula]).find('div')[1]).find('button')[0]).css('height', this.keysHeightSize);
                      }
     
                    }
                  }

                  if(this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img' ){

                    let sElContentTmp = $('[id=content]');
                    for(let step = 0 ; step < this.globColumnQnty; step++){
    
                      let formula = this.globColumnQnty*Number(drainY)+Number(step);
                      

                      if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      } else {
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      }

                      
                      if( $($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0] ){
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      } else {

                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[1]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[1]).find('button')[0]).css('height', this.imgMaxHeightSize);  
                        }
                        
                      }

                      if( $($(sElContentTmp)[formula]).find('input')[0] ){
   
                        if(this.ENABLE_TEXT_MODE){
                          $($($(sElContentTmp)[formula]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);
                        } else {
                          $($($(sElContentTmp)[formula]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      } else {
    
                        if(this.ENABLE_TEXT_MODE) {
                          $($($(sElContentTmp)[formula]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($(sElContentTmp)[formula]).find('button')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      }



     
                    }
                  }
                  
                  
    }


    
        /////////////////////////////
     ////////////////////////
    // FUNÇÕES AUXILIARES //
   ////////////////////////
    ////////////////////////////
      
    /**
       * Shows a modal window
       *
       * @method showModal
       * @param component {any} the component to be showed in a modal form
       * @returns void {void}
       * @public
       */
    public showModal(component){
        const activeModal = this.modalService.open(component, {size: 'lg', container: 'nb-layout'});
        this.modal = activeModal;
    }

        /**
       * Close an open modal window
       *
       * @method closeModal
       * @param component {any} the component to be showed in a modal form
       * @returns void {void}
       * @public
       */
    public closeModal(){
      this.modal.close();
      this.modal = null;
  } 


      /**
       * Consumes all information in the replicant and populates the OpenFACLayout object with it.
       *
       * @method populateLayout
       * @param replicant {TecladoModel} the matrix representation of the keyboard that are being replicated and generated
       * @param email {string} user email
       * @returns openFacLayout {OpenFACLayout} the object containing all leyboard layout information
       * @public
       */
    public populateLayout(replicant: TecladoModel, email: string): OpenFACLayout{
      let openFacLayout = new OpenFACLayout(); 
      openFacLayout.nameLayout = replicant.type;
      openFacLayout.email = email; 
      openFacLayout.magnify = replicant.magnify;

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
                  openFacLayout.Lines[i].Buttons[j].Image = teclado.image[i][j]; 
          }
      } 

      return openFacLayout;
   }

        /**
       * Show a window for the user select the keyboard to delete.
       *
       * @method deleteKeyboardLayout
       * @param void {void}
       * @returns void {void} 
       * @public
       */
   public deleteKeyboardLayout(){
    this.showModal(DeleteLayoutModalComponent);
  
    this.keyboardItems.KeyboardsNames.push(this.keyboardName);
    this.keyboardToEdit = this.keyboardName;
   }



   
        /////////////////////////////
     ////////////////////
    // SALVAR TECLADO //
   ////////////////////
    ////////////////////////////

        /**
       * Creates a new TecladoModel object to be inserted into database. Sets all informations and send it to backend.
       *
       * @method saveKeyboardLayout
       * @param saveAs? {boolean} Optional param to inform if is a normal save or a save as some specific file.
       * @returns void {void} 
       * @public
       */
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
      finalKeyboard.image = [];  


      for(let i = 0; i< this.tecladoReplicant.teclas.length; i++){ 
        let tam = 0; 
        let teclasLine = new Array(); 
        let textLine = new Array(); 
        let actionLine = new Array();  
        let imageLine = new Array();  
        teclasLine = []; 
        textLine = []; 
        actionLine = [];  
        imageLine = [];  
        for(let j=0; j < this.tecladoReplicant.teclas[i].length; j++){ 
           if(this.tecladoReplicant.teclas[i][j] !== "" && this.tecladoReplicant.teclas[i][j] !== " "){ 
             teclasLine.push(this.tecladoReplicant.teclas[i][j]); 
             textLine.push(this.tecladoReplicant.text[i][j]); 
             actionLine.push(this.tecladoReplicant.action[i][j]);  
             imageLine.push(this.tecladoReplicant.image[i][j]);   
             tam += 1; 
            }  

        }

        if(tam > 0) { 
          finalKeyboard.teclas.push(teclasLine);  
          finalKeyboard.text.push(textLine);
          finalKeyboard.action.push(actionLine); 
          finalKeyboard.image.push(imageLine);  
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
                  finalKeyboard.magnify = this.growthTextFactor;
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
                               finalKeyboard.magnify = this.growthTextFactor;
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
            finalKeyboard.magnify = this.growthTextFactor;
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


   
        /////////////////////////////
     /////////////////////////////////////////////
    // RECARREGA LISTA DE TECLADOS PARA EDITAR //
   /////////////////////////////////////////////
    ////////////////////////////

    
        /**
       * Check for addition or subtraction in the number of user keyboards. So, it triggers an event that reload the names of keyboards still existent.
       *
       * @method  reloadList
       * @param void {void} 
       * @returns void {void} 
       * @public
       */
  public reloadList(){
      
      this.keyboardNamesSubscribe.unsubscribe();
      let user = this.authService.getLocalUser();
      this.keyboardNamesSubscribe = this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
            this.keyboardItems = result;
            
      });

   }


   
        /////////////////////////////
     //////////////////////////////////
    // CRIAÇÂO DE TECLADO EM BRANCO //
   //////////////////////////////////
    ////////////////////////////

        /**
       * Creates all the basic and empty structure of a keyboard, then populates the global replicant with this structure. Also creates the basic keyboard that
       * serves the Keyboard Layout Editor.
       *
       * @method  createEmptyKeyboard
       * @param void {void} 
       * @returns void {void} 
       * @public
       */
    
    private createEmptyKeyboard(){
      let rows = 5;
      if(this.smallerScreenSize){
        rows = 6;
      }

      for (let i = 0; i < rows; i++) {
        this.teclado.teclas[i] = [[]];
        this.teclado.text[i] = [[]]; 
        this.teclado.action[i] = [[]];
        this.teclado.image[i] = [[]];   
        this.tecladoReplicant.teclas[i] = [[]];
        this.tecladoReplicant.text[i] = [[]];
        this.tecladoReplicant.action[i] = [[]];  
        this.tecladoReplicant.image[i] = [[]];  
         let line = new Array();
         let textL = new Array(); 
         let actionL = new Array();  
         let imageL = new Array();   
         let lineReplicant = new Array();
         let textReplicant = new Array(); 
         let actionReplicant = new Array(); 
         let imageReplicant = new Array();  
         line = [];
         textL = []; 
         actionL = [];  
         imageL = [];   
         lineReplicant = [];
         textReplicant = [];
         actionReplicant = [];   
         imageReplicant = [];    
          for (let j = 0; j < this.globColumnQnty; j++) {
              line[j] = "";
              textL[j] = "";  
              actionL[j] = "";   
              imageL[j] = "";   
              lineReplicant[j] = "";
              textReplicant[j] = ""; 
              actionReplicant[j] = "";  
              imageReplicant[j] = "";   

          }

          this.teclado.teclas[i] = line;
          this.teclado.text[i] = textL; 
          this.teclado.action[i] = actionL; 
          this.teclado.image[i] = imageL;  
          this.tecladoReplicant.teclas[i] = lineReplicant;  
          this.tecladoReplicant.text[i] = textReplicant;  
          this.tecladoReplicant.action[i] = actionReplicant;  
          this.tecladoReplicant.image[i] = imageReplicant;   

          this.lines = this.teclado.teclas.length;
      }  
      
      let row: string[], pRow: string[], sRow: string[], tRow: string[], zRow: string[], zzRow: string[]; 
      if(this.smallerScreenSize){
        row = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'];
        pRow = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '['];
        sRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn'];
        tRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '*arrowleft', '*arrowright'];
        zRow = ['*mic', '*space', '\\',  '*arrowdown', '=', '', '', '', '', '', '', ''];
        zzRow = [ '*bckspc', ']', 'PULA', '*arrowup', '', '', '', '', '', '', '', '']
      } else {
        row = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
        pRow = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
        sRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn', 'PULA', '*arrowdown'];
        tRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '*arrowleft', '*arrowright', '*arrowup', ''];
        zRow = ['*mic', '*space', '', '', '', '', '', '', '', '', '', '', '', ''];
      }

  
       this.masterKeys.teclas.push(row);
       this.masterKeys.teclas.push(pRow);
       this.masterKeys.teclas.push(sRow);
       this.masterKeys.teclas.push(tRow);
       this.masterKeys.teclas.push(zRow); 
       if(this.smallerScreenSize){
        this.masterKeys.teclas.push(zzRow); 
       }


    }

       /**
       * Inserts a blank line in the replicant and the main keyboard matrix.
       *
       * @method  addLine
       * @param void {void} 
       * @returns void {void} 
       * @public
       */
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
        this.teclado.image.push(line);   
        this.tecladoReplicant.teclas[this.tecladoReplicant.teclas.length] = lineReplicant;
        this.tecladoReplicant.text[this.tecladoReplicant.text.length] = lineReplicant; 
        this.tecladoReplicant.action[this.tecladoReplicant.action.length] = lineReplicant;  
        this.tecladoReplicant.image[this.tecladoReplicant.image.length] = lineReplicant;   
        
        this.lines = this.teclado.teclas.length;
    }  
    
        /**
       * Remove a line in the replicant and the main keyboard matrix.
       *
       * @method  removeLine
       * @param void {void} 
       * @returns void {void} 
       * @public
       */
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


        /////////////////////////////
     ////////////////////////
    // INSERT DAS IMAGENS //
   ////////////////////////
    ////////////////////////////

    
        /**
       * This method shows a modal window for capture user information about button labels, text, image and action type.
       *
       * @method  editCaptionNText
       * @param event {any} parameter passed by the double click event over a dragula unit. 
       * @returns void {void} 
       * @public
       */
    public editCaptionNText(event){
        let DEBUG = true;
        let DEBUG2 = true;
        
        if(DEBUG) console.clear();
        if(DEBUG) console.log("-------------------INSERT---------------------")

        this.showModal(CaptionTextModalComponent);
        
        let parts = event.target.className.split(' ');

        let text;
        let action;
        let image; 
        let teclas;

        if(parts[0].indexOf('#') !== -1){
          if(parts[0].substring(0,1) === "@") parts[0] = parts[0].split('$')[1];

          let x = <number>parts[0].split('#')[0];
          let y = <number>parts[0].split('#')[1];

          if(DEBUG) console.log('x: ' + x + ' y: ' + y)
          this.x = x;
          this.y = y;

          teclas = this.tecladoReplicant.teclas[y][x];
          text = this.tecladoReplicant.text[y][x];
          action = this.tecladoReplicant.action[y][x];
          image = this.tecladoReplicant.image[y][x];


        } else {


          let x = <number>parts[1].split('#')[0];
          let y = <number>parts[1].split('#')[1];
          if(DEBUG) console.log('x: ' + x + ' y: ' + y)
          
          this.x = x;
          this.y = y;
          

          teclas = this.tecladoReplicant.teclas[y][x];
          text = this.tecladoReplicant.text[y][x];
          action = this.tecladoReplicant.action[y][x];
          image = this.tecladoReplicant.image[y][x]; 
            

          
        }

        

        let payload = new Array();

        payload.push(event);
        payload.push(text);
        payload.push(action);
        if(DEBUG) console.log('IMAGE: ' + image)
        payload.push(image);
        payload.push(teclas);


        this.captionTextService.emitCaptionText(payload);


        this.payloadSubscription = this.layoutEditorService.subscribeToLayoutEditorPayloadSubject().subscribe((result)=>{
              
          let inputCount = 0, buttonCount = 0;


              if(DEBUG) console.clear();

              let buttonText = "";
              buttonText = result[0];

              let buttonCaption = "";
              buttonCaption = result[1];
          
              let buttonAction = "";
              buttonAction = result[2];

              let buttonImage = "";  
              buttonImage = result[3];  



              let imgUrl = result[4];
              let height = result[5];
              let width = result[6];              
              let sysImg = result[7];
              let imagem = result[8];



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

         

              if(buttonText === undefined) buttonText = " ";
              if(buttonCaption === undefined) buttonCaption = " ";
              if(buttonAction === undefined || buttonAction === "") buttonAction = "Keyboard";
              if(buttonImage === undefined) buttonImage = " "; 
 

              
              let parts = event.target.className.split(' ');
              let x, y;

              if(DEBUG) console.log(parts);
              if(parts[0] === '@copyArea$') {
                  parts = parts[1];
                  x = parts.split('#')[0];
                  y = parts.split('#')[1];
              } else {
                x = parts[0].split('#')[0];
                y = parts[0].split('#')[1];
              }    



              let formula = this.globColumnQnty*Number(y)+Number(x);


              this.markOfRemove = false;


               if(imagem && this.IMAGE_TESTE){
                    this.markOfRemove = true;
                  
                        let quantity = Math.floor(this.keyboardContainerSize / this.keysWidthSize)
                        if(this.smallerScreenSize){
                          this.choppedNumber = quantity-this.keysRemoved; 
                        } else {
                          this.choppedNumber = quantity;
                        }
                          
                          this.choppedLines.push(y);
     
               } 


               let notX = false;


              $(event.target).attr('value', buttonCaption);


                let el, copied, copyToTarget = false;
                if(DEBUG) console.log("MARK-LAYOUT-1");

                if(event.target.value){
                  if(DEBUG) console.log("MARK-LAYOUT-2");

                  el = $(event.target)[0];
 
                  copyToTarget = true;
                } else {
                  if(DEBUG) console.log("MARK-LAYOUT-3");
                    let sEl = $("[id=copy]").clone();
                    
                    let el1 = document.getElementsByClassName('@copyArea$'+ x +'#'+ y +'');
                    

                    if(el1.length > 1) { 
                        //el1.item(1).remove();
                        if(DEBUG) console.log("MARK-LAYOUT-4");
                    }     

                    
                    if(sEl[<number>formula] === undefined) {
                      if(DEBUG) console.log("MARK-LAYOUT-5");
                      el = $(event.target)[0].cloneNode(true);
                      $($(event.target)[0]).find('input').remove();
                      copyToTarget = true;
                    } else {
                      if(DEBUG) console.log("MARK-LAYOUT-6");

                      if($($(event.target)[0].attributes)[4].textContent.substring(0,10) === 'background'){
                        
                      }

                      el = sEl[0].cloneNode(true);
                      
                    }

                }


                if(DEBUG) console.log("MARK-LAYOUT-7");
                let normal = false;

                if($(el).find('input')[0]){
                  if(DEBUG) console.log("MARK-LAYOUT-8");
                  normal = true;

                  if(buttonCaption !== "*img") {
                    if(DEBUG) console.log("MARK-LAYOUT-9");

                      $($(el).find('input')[0]).attr('value', buttonCaption);
                      
                      let found = false;
                      for(let step=0; step< this.imgLinesArray.length; step++){
                        if(this.imgLinesArray[step].toString() === y.toString()) {
                          found = true;
                          break;
                        }
                      }
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      if( found ) { 
                        if(DEBUG) console.log("MARK-LAYOUT-10");
                        if(DEBUG) console.log("SIZE CHANGER 1")
                          $($(el).find('input')[0]).css('height', this.imgMaxHeightSize);
                      }    
                  } else {
                    $($(el).find('input')[0]).attr('value', '');
                    
                    
                    if(DEBUG) console.log("MARK-LAYOUT-11");
                  }    
                   

                  
                  if(( imgUrl || sysImg) && imagem  ){


                      let found = false; 
                      if(DEBUG) console.log("MARK-LAYOUT-12");
      
                      if(this.choppedNumber !== this.globColumnQnty){
                        if(DEBUG) console.log("MARK-LAYOUT-13");
                        for(let unit = 0; unit < this.imgLinesArray.length; unit++){
                          if(this.imgLinesArray[unit].toString() === y.toString()){
                            found = true;
                            break;
                          }
                        }
      
                        let oldValueX = x;
                        if(!found) {
                          if(DEBUG) console.log("MARK-LAYOUT-14");
                            x = this.mapToNewFormula(x,y, this.choppedNumber,false);
                              

                            if(this.tecladoReplicant.teclas[y][x] !== ''){
                              formula = this.globColumnQnty*Number(y)+Number(x);
                              if($($("[id=content]")[formula]).find('input')[0]){
                                $($("[id=content]")[formula]).find('input')[0].remove(); 
                              }
                              if($($("[id=content]")[formula]).find('button')[0]){
                                $($("[id=content]")[formula]).find('button')[0].remove();
                              }
                            }


                              notX = true;
                        }

                          ////////////////////           ///////////
                         //////////////////////////////////////////
                        //     FAZ REMANEJAMENTO DE TECLAS      //
                       ////////////////////////////////////////// 
                      /////////                     ////////////
                        
                      let sElContent = $("[id=content]")
                      if(DEBUG) console.log("MARK-LAYOUT-15");

                      
                        for(let line = 0; line < this.tecladoReplicant.teclas.length; line++){
                            for(let col = 0; col < this.tecladoReplicant.teclas[line].length; col ++){
                              let newformula = this.globColumnQnty*Number(line)+Number(col);
                              if($($('[id=content]')[newformula]).find('input')[0]){
                                inputCount += 1 ;
                              }
                              if($($('[id=content]')[newformula]).find('button')[0]){
                                buttonCount += 1 ;
                              }
                            }
                        }

                        if(inputCount < this.choppedNumber || buttonCount < this.choppedNumber){
                            if(!this.checkLineHasImage(y)){
                              if(DEBUG) console.log("MARK-LAYOUT-16");
                                this.keysRelocation(x,y);
                            }        
                        }
                        

                 }  
            
 
                      if(sysImg){
                        if(DEBUG) console.log("MARK-LAYOUT-17");
                        if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                        if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                        this.changeDragulaBackground( $($(el)), buttonImage, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);  
                      } else {
                        if(DEBUG) console.log("MARK-LAYOUT-18");
                        if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                        if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                        this.changeDragulaBackground( $($(el)), "data:image/png;base64,"+ imgUrl, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);
                      }
                      if(DEBUG) console.log("MARK-LAYOUT-19");
                      $($(el).find('input')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
                      $($(el).find('input')[0]).attr('display', 'none');
   
                } 


                } else if($(el).find('button')[0]){
                  if(DEBUG) console.log("MARK-LAYOUT-20");
                  normal = true;
     
                  if($($(el).find('button')[0]).find('mat-icon')[0]) $($(el).find('button')[0]).find('mat-icon')[0].remove();
                  if(DEBUG) console.log("MARK-LAYOUT-21");
                  $($(el).find('button')[0]).text(buttonCaption);
                  if(buttonCaption !== "*img") {
                    if(DEBUG) console.log("MARK-LAYOUT-22");
                      $($(el).find('button')[0]).attr('value', buttonCaption);
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      if(this.imgLinesArray.includes(x)) $($(el).find('button')[0]).css('height', this.imgMaxHeightSize);
                  } else {
                    if(DEBUG) console.log("MARK-LAYOUT-23");
                    $($(el).find('button')[0]).attr('value', '');
                  }        
                  
                  if( (imgUrl || sysImg ) & imagem){
    
                    if(DEBUG) console.log("MARK-LAYOUT-24");
                      let found = false; 
      
                      if(this.choppedNumber !== this.globColumnQnty){
                        if(DEBUG) console.log("MARK-LAYOUT-25");
                        for(let unit = 0; unit < this.imgLinesArray.length; unit++){
                          if(this.imgLinesArray[unit].toString() === y.toString()){
                            found = true;
                            break;
                          }
                        }
      
                        let oldValueX = x;
                        if(!found) {
                          if(DEBUG) console.log("MARK-LAYOUT-26");
                              x = this.mapToNewFormula(x,y, this.choppedNumber, false);

                              if(this.tecladoReplicant.teclas[y][x] !== ''){
                                formula = this.globColumnQnty*Number(y)+Number(x);
                                if($($("[id=content]")[formula]).find('input')[0]){
                                  $($("[id=content]")[formula]).find('input')[0].remove(); 
                                }
                                if($($("[id=content]")[formula]).find('button')[0]){
                                  $($("[id=content]")[formula]).find('button')[0].remove();
                                }
                              }

                              notX = true;
                        }


                 }

                    
                    if(sysImg){
                      if(DEBUG) console.log("MARK-LAYOUT-27");
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      this.changeDragulaBackground( $($(el)), buttonImage, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);  
                    } else {
                      if(DEBUG) console.log("MARK-LAYOUT-28");
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      this.changeDragulaBackground( $($(el)), "data:image/png;base64,"+ imgUrl, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);
                    }
                    if(DEBUG) console.log("MARK-LAYOUT-29");
                    $($(el).find('button')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
                    $($(el).find('button')[0]).attr('display', 'none');
          
                  } 

                }

                if(!imagem) buttonImage = "";


                if(!notX){
                  if(DEBUG) console.log("MARK-LAYOUT-30");
                    if(x.split("$")[0] === '@copyArea') x = x.split('$')[1];

                    
                }    
             


                this.tecladoReplicant.action[y][x] = buttonAction;

                if(buttonCaption === '*img') {

                  this.tecladoReplicant.teclas[y][x] = buttonCaption + '$'+this.imgMaxHeightSize+'#'+this.imgMaxWidthSize ;
                } else {

                  this.tecladoReplicant.teclas[y][x] = buttonCaption;
                }  

                this.tecladoReplicant.text[y][x] = buttonText;

                this.tecladoReplicant.image[y][x] = buttonImage; 

                if(DEBUG) console.log(JSON.stringify(this.imgLinesArray))
                if(DEBUG) console.log('!this.imgLinesArray.includes(y.toString()): ' + !this.imgLinesArray.includes(y.toString()))

                let found = false;
                for(let step=0; step< this.imgLinesArray.length; step++){
                  if(this.imgLinesArray[step].toString() === y.toString()) {
                    found = true;
                    break;
                  }
                }

                if(this.tecladoReplicant.teclas[y][x].split('$')[0] === '*img' && !found) {
                  this.imgLinesArray.push(Number(y));
                }  
                if(DEBUG) console.log(JSON.stringify(this.imgLinesArray))

                if(!normal){
                  if(DEBUG) console.log("MARK-LAYOUT-31");
                  if($(el).find('mat-icon')[0]) $(el).find('mat-icon')[0].remove();
                  
                  $(el).text(buttonCaption);
                  if(buttonCaption !== "*img") {
                    if(DEBUG) console.log("MARK-LAYOUT-32");
                      $(el).attr('value', buttonCaption);
                  } else {
                    if(DEBUG) console.log("MARK-LAYOUT-33");
                    $(el).attr('value', '');
                  }        
                  
                  if( (imgUrl !== "" || sysImg ) & imagem){
                    if(DEBUG) console.log("MARK-LAYOUT-34");
                    
                    if(sysImg){     
                      if(DEBUG) console.log("MARK-LAYOUT-35");        
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      this.changeDragulaBackground( $($(el)), buttonImage, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);  
                    } else {
                      if(DEBUG) console.log("MARK-LAYOUT-36");
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      this.changeDragulaBackground( $($(el)), "data:image/png;base64,"+ imgUrl, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);
                    }
                    
     
                  } 

                }

                $(el).removeAttr('tooltip');
                

                if(this.choppedNumber !== this.globColumnQnty){
                  if(DEBUG) console.log("MARK-LAYOUT-37");
                  formula = this.globColumnQnty*Number(y)+Number(x);
                  
                  if(DEBUG) console.log('inputCount: ' + inputCount + ' buttonCount: ' + buttonCount)
                  if(inputCount >= this.choppedNumber || buttonCount >= this.choppedNumber){
                        if(!this.checkLineHasImage(y)){
                          if(DEBUG) console.log("MARK-LAYOUT-16");
                            this.keysRelocation(x,y);
                        }     
                  }      

                   let line = y;
                    for(let col = 0; col < this.tecladoReplicant.teclas[line].length; col++){
                      
                      if(DEBUG) console.log(this.choppedNumber)
                      if(col >= this.choppedNumber && this.tecladoReplicant.teclas[line][col] !== ''){
                        if(DEBUG) console.log("ENCONTROU ELEMENTO ALÉM DO LIMIAR: " + this.tecladoReplicant.teclas[line][col]);
                        let newformula = this.globColumnQnty*Number(line)+Number(col);
                        if($($('[id=content]')[newformula]).find('input')[0]){
                          $($('[id=content]')[newformula]).find('input')[0].remove();
                        }
                        if($($('[id=content]')[newformula]).find('button')[0]){
                          $($('[id=content]')[newformula]).find('button')[0].remove();
                        }
                        this.tecladoReplicant.teclas[line][col] = '';
                        this.tecladoReplicant.action[line][col] = '';
                        this.tecladoReplicant.text[line][col] = '';
                        this.tecladoReplicant.image[line][col] = '';

                      }
                    }

                } else {
                  if(DEBUG) console.log("MARK-LAYOUT-38");

                      // REMOVE EXTRA KEYS
                      let line = y;
                     
                        for(let col = 0; col < this.tecladoReplicant.teclas[line].length; col++){
                          if(col >= this.choppedNumber && this.tecladoReplicant.teclas[line][col] !== ''){
                            if(DEBUG) console.log("ENCONTROU ELEMENTO ALÉM DO LIMIAR: " + this.tecladoReplicant.teclas[line][col]);
                            let newformula = this.globColumnQnty*Number(line)+Number(col);
                            if($($('[id=content]')[newformula]).find('input')[0]){
                              $($('[id=content]')[newformula]).find('input')[0].remove();
                            }
                            if($($('[id=content]')[newformula]).find('button')[0]){
                              $($('[id=content]')[newformula]).find('button')[0].remove();
                            }
                            this.tecladoReplicant.teclas[line][col] = '';
                            this.tecladoReplicant.action[line][col] = '';
                            this.tecladoReplicant.text[line][col] = '';
                            this.tecladoReplicant.image[line][col] = '';
    
                          }
                        }
               

                      if(inputCount >= this.choppedNumber || buttonCount >= this.choppedNumber){
                          if(!this.checkLineHasImage(y)){
                            if(DEBUG) console.log("MARK-LAYOUT-16");
                              this.keysRelocation(x,y);
                          }        
                      }    
                      if(DEBUG) console.log(el);
 
                }
                     

                if(imagem) $(el).attr('class', '@copyArea$' + ' ' + x + '#' + y + '');
                  
                if(!copyToTarget){
                if(DEBUG) console.log($("[id=content]")[formula])
               if($($("[id=content]")[formula]).find('div')[0]) $($("[id=content]")[formula]).find('div')[0].remove();
               if($($("[id=content]")[formula]).find('div')[0]) $($("[id=content]")[formula]).find('div')[0].remove();

               if(DEBUG) console.log("OBTIDO:")
               if(DEBUG) console.log("x: " + x + ' y: ' + y);
             

                   $("[id=content]")[formula].appendChild(el);  

                } else {
                      if(imagem) $(el).attr('class', '@copyArea$' + ' ' + x + '#' + y + '');

                      let removeFormula = this.globColumnQnty*Number(y)+Number(x);
     
                      if($($("[id=content]")[formula]).find('div')[0]) $($("[id=content]")[formula]).find('div')[0].remove();
                      if($($("[id=content]")[formula]).find('div')[0]) $($("[id=content]")[formula]).find('div')[0].remove();
                      if(DEBUG) console.log($("[id=content]")[formula])


                      if(DEBUG) console.log("OBTIDO:")
                      if(DEBUG) console.log("x: " + x + ' y: ' + y);
            
                      
                      $("[id=content]")[formula].appendChild(el);  
                }   


                if( ( imgUrl || sysImg ) && imagem ){
                  if(DEBUG) console.log("MARK-LAYOUT-39");
                      let sElContent = $("[id=content]");
                      let sElLines = $("[id=blankLines]");
                      let sElRows = $("[id=blankRows]");
                      let sElNone = $("[id=blankNone]");

                      let randomColor =  this.getRandomColor();

                      for(let imgLine = 0; imgLine < this.imgLinesArray.length ; imgLine++ ){
                        for(let col=0; col < this.globColumnQnty ; col++){
                          if(col >= this.choppedNumber) continue;
                          if(DEBUG) console.log("MARK-LAYOUT-40");
                            let formula = this.globColumnQnty*Number(this.imgLinesArray[imgLine])+Number(col);
                            
                            
                            if(this.ENABLE_TEXT_MODE){
                              if(DEBUG) console.log("MARK-LAYOUT-41");
                              $($(sElContent)[formula]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                            } else {
                              if(DEBUG) console.log("MARK-LAYOUT-42");
                              $($(sElContent)[formula]).css('height', this.imgMaxHeightSize);
                            }
                            
                            $($(sElContent)[formula]).css('width', this.keysWidthSize);
                              
                            
                            if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                            if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
              
                          

                            if(this.ENABLE_TEXT_MODE){
                              if(DEBUG) console.log("MARK-LAYOUT-43");
                              $($(sElLines)[this.imgLinesArray[imgLine]]).css('height', this.imgMaxHeightSize + this.textModeFactor);
                              $($(sElRows)[this.imgLinesArray[imgLine]]).css('height', this.imgMaxHeightSize + this.textModeFactor);

                              $($(sElLines)[this.imgLinesArray[imgLine]]).css('margin-bottom', 4 + this.textModeMarginFactor);
                              $($(sElRows)[this.imgLinesArray[imgLine]]).css('margin-bottom', 4 + this.textModeMarginFactor);
                            } else {
                              if(DEBUG) console.log("MARK-LAYOUT-44");
                              $($(sElLines)[this.imgLinesArray[imgLine]]).css('height', this.imgMaxHeightSize);
                              $($(sElRows)[this.imgLinesArray[imgLine]]).css('height', this.imgMaxHeightSize);

                              $($(sElLines)[this.imgLinesArray[imgLine]]).css('margin-bottom', 4);
                              $($(sElRows)[this.imgLinesArray[imgLine]]).css('margin-bottom', 4);
                            }
                            

                        }    
                      }


        
                      for(let line = 0 ; line < this.tecladoReplicant.teclas.length; line++){
                        for(let col = 0 ; col < this.tecladoReplicant.teclas[line].length; col++){
                          let formula = this.globColumnQnty*Number(line)+Number(col);
                          
                              if( Number($($(sElContent)[formula])[0].className.split(' ')[0].split('#')[0]) >= this.choppedNumber 
                                && this.imgLinesArray.includes(line)){
                                  if(DEBUG) console.log("MARK-LAYOUT-45");
                                $($($(sElContent)[formula])[0]).css('visibility', 'hidden');
                
                              }
                              
                        }
                      }
    
                    }



                    let sElContentTmp = $("[id=content]");
                    for(let line = 0; line < this.imgLinesArray.length; line++){
                      for(let col = 0; col < this.globColumnQnty; col++){

                        if(col >= this.choppedNumber) continue;

                        let formula = this.globColumnQnty*Number(this.imgLinesArray[line])+Number(col);

                        formula = this.findElement(sElContentTmp,this.imgLinesArray[line], col )

                        if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                        if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                        if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                          if(DEBUG) console.log("MARK-LAYOUT-46");
                          if(this.ENABLE_TEXT_MODE){
                            if(DEBUG) console.log("MARK-LAYOUT-47");
                            $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize);  
                          } else {
                            if(DEBUG) console.log("MARK-LAYOUT-48");
                            $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);
                          }
                          
                        } 
                        if( $($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0] ){
                          if(DEBUG) console.log("MARK-LAYOUT-49");
                          if(this.ENABLE_TEXT_MODE){
                            $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                          } else {
                            if(DEBUG) console.log("MARK-LAYOUT-50");
                            $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.imgMaxHeightSize);
                          }
                          
                        }

                      }
                    }    


                    // CHANGE SIZE OF NORMAL KEYS
                     let sElContent = $("[id=content]");
                    for(let x = 0; x < this.tecladoReplicant.teclas.length; x++){
                      for(let y=0; y< this.tecladoReplicant.teclas[x].length; y++){
                        let formula = this.globColumnQnty*Number(x)+Number(y);
                        
                        if( $($(sElContent)[formula]).find('input')[0] && this.imgLinesArray.includes(x) ){
                          if(DEBUG) console.log("MARK-LAYOUT-51");
                          $($($(sElContent)[formula]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        } else if( $($(sElContent)[formula]).find('button')[0] && this.imgLinesArray.includes(x) ){
                          if(DEBUG) console.log("MARK-LAYOUT-52");
                          $($($(sElContent)[formula]).find('button')[0]).css('height', this.imgMaxHeightSize);
                        }
                      }
                    }

                    // CHANGE SIZE OF ALL ROWS FOR NORMALIZING
                    sElContent = $("[id=content]");
                    for(let x = 0; x < this.tecladoReplicant.teclas.length; x++){
                      for(let y=0; y< this.tecladoReplicant.teclas[x].length; y++){
                        let formula = this.globColumnQnty*Number(x)+Number(y);
                        if(!this.imgLinesArray.includes(x) ){
                          if(DEBUG) console.log("MARK-LAYOUT-53");
                            if(this.smallerScreenSize){
                              if(DEBUG) console.log("MARK-LAYOUT-54");
                              $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal-15);
                            } else {
                              if(DEBUG) console.log("MARK-LAYOUT-55");
                              $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal);
                            }
                              
                        }      
                      }
                    }

                    this.payloadSubscription.unsubscribe();
                    
                    if(DEBUG2) console.log("imgLINES:")
                    if(DEBUG2) console.log(JSON.stringify(this.imgLinesArray))


                    if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.teclas))
                    if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.action))
                    if(DEBUG) console.log(JSON.stringify(this.tecladoReplicant.text))
                    

        })
        


      }


        /**
       * This method relocates all dragula's units surrounding the (x,y) position of the input image, to fill available spaces or discard elements in excess.
       *
       * @method  keysRelocation
       * @param x {number} x position of the input image
       * @param y {number} y position of the input image
       * @returns void {void} 
       * @public
       */
      public keysRelocation(x: number, y: number){
       
          let DEBUG = true;

          if(DEBUG) console.log("--------------RELOCATION-ACTIVATED!!!--------")

            if(DEBUG) console.log("RELOCATION ACTIVATED!");
            if(DEBUG) console.log("CHOPPED NUMBER:")
            if(DEBUG) console.log(this.choppedNumber)
            let sElContent = $('[id=content]');


            let numberOfElements = 1;
            for(let unit = 0; unit < this.choppedNumber; unit++){
              if(DEBUG) console.log("loop1")
              if(this.tecladoReplicant.teclas[y][unit] !== ''){
                numberOfElements += 1;
              }
            }

            for(let uCol = 0; uCol < this.tecladoReplicant.teclas[y].length; uCol++){
                                
              let rearrangedFormula = this.globColumnQnty*Number(y)+Number(uCol);
            

           
            if($(sElContent[rearrangedFormula]).find('input')[0]){
                if(DEBUG) console.log("-----------------------------")
                if(DEBUG) console.log("NO CASO INPUT:")

                let copy = $(sElContent[rearrangedFormula]).find('input')[0].cloneNode(true);
                $(sElContent[rearrangedFormula]).find('input')[0].remove();
                let newUnit = this.mapToNewFormula(uCol, y, this.choppedNumber, false);
                if(newUnit === x && newUnit !== 0){
                  if(DEBUG) console.log("ELEMENTOS EM POSIÇÕES IGUAIS NO REALOCATION")
                  if(DEBUG) console.log("IGUAIS: newUnit --> " + newUnit + ' x --> ' + x );
                  newUnit = newUnit - 1;
                }
                rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);
                
                while(this.tecladoReplicant.teclas[y][newUnit] !== '' && newUnit >= 0 ){
                  if(DEBUG) console.log( 'A[' + this.tecladoReplicant.teclas[y][newUnit] + ' ' +  newUnit + ']');
                  newUnit = newUnit - 1;
                }

                if(newUnit < 0 ) {
                  if(DEBUG) console.log("MENOR QUE ZERO!")
                  newUnit = newUnit + 1;
                  while(this.tecladoReplicant.teclas[y][newUnit] !== '' && newUnit >= 0 && newUnit < this.choppedNumber){
                    if(DEBUG) console.log( 'B[' + this.tecladoReplicant.teclas[y][newUnit] + ' ' +  newUnit + ']');
                    newUnit = newUnit + 1;
                  }
                  if(newUnit > this.choppedNumber) {
                    if(DEBUG) console.log("MAIOR QUE CHOPPEDNUMBER1")
                    return;
                  }  
                }    
                if(newUnit > this.choppedNumber) {
                  if(DEBUG) console.log("MAIOR QUE CHOPPEDNUMBER2")
                  return;
                } 


                if(newUnit === x) {
                  let foundBlank = false;
                  for(let unit = 0 ; unit < this.choppedNumber; unit++){
                    if(this.tecladoReplicant.teclas[y][unit] === "" && unit !== x){
                      foundBlank = true;
                      newUnit = unit;
                      break;
                    }
                  }
                  
                  if(!foundBlank && numberOfElements !== this.choppedNumber) {
                    if(DEBUG) console.log('nElements: ' + numberOfElements);
                    if(DEBUG)  console.log("!foundBlank");
                    return;
                  } 
                  
                } 


                if(DEBUG) console.log("FINAL NEWUNIT: " + newUnit);
                rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);

                if(DEBUG) console.log("LOCUS: ");
                if(DEBUG) console.log(sElContent[rearrangedFormula]);

                sElContent[rearrangedFormula].appendChild(copy);

                this.tecladoReplicant.teclas[y][newUnit] = this.tecladoReplicant.teclas[y][uCol];
                this.tecladoReplicant.teclas[y][uCol] = "";
                this.tecladoReplicant.action[y][newUnit] = this.tecladoReplicant.action[y][uCol];
                this.tecladoReplicant.action[y][uCol] = "";
                this.tecladoReplicant.text[y][newUnit] = this.tecladoReplicant.text[y][uCol];
                this.tecladoReplicant.text[y][uCol] = "";
                this.tecladoReplicant.image[y][newUnit] = this.tecladoReplicant.image[y][uCol];
                this.tecladoReplicant.image[y][uCol] = "";

            
              } else if($(sElContent[rearrangedFormula]).find('button')[0]){
          
                if(DEBUG) console.log("-----------------------------")
                if(DEBUG) console.log("NO CASO BUTTON:")

                let copy = $(sElContent[rearrangedFormula]).find('button')[0].cloneNode(true);
                $(sElContent[rearrangedFormula]).find('button')[0].remove();
                let newUnit = this.mapToNewFormula(uCol, y, this.choppedNumber, false);
                if(newUnit === x && newUnit !== 0){
                  if(DEBUG) console.log("ELEMENTOS EM POSIÇÕES IGUAIS NO REALOCATION")
                  if(DEBUG) console.log("IGUAIS: newUnit --> " + newUnit + ' x --> ' + x );
                  newUnit = newUnit - 1;
                }
                rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);

                while(this.tecladoReplicant.teclas[y][newUnit] !== '' && newUnit >= 0 ){
                  if(DEBUG) console.log( 'A[' + this.tecladoReplicant.teclas[y][newUnit] + ' ' +  newUnit + ']');
                  newUnit = newUnit - 1;
                }

                if(newUnit < 0 ) {
                  if(DEBUG) console.log("MENOR QUE ZERO!")
                  newUnit = newUnit + 1;
                  while(this.tecladoReplicant.teclas[y][newUnit] !== '' && newUnit >= 0 && newUnit < this.choppedNumber){
                    if(DEBUG) console.log( 'B[' + this.tecladoReplicant.teclas[y][newUnit] + ' ' +  newUnit + ']');
                    newUnit = newUnit + 1;
                  }
                  if(newUnit > this.choppedNumber) {
                    if(DEBUG) console.log("MAIOR QUE CHOPPEDNUMBER1")
                    return;
                  }  
                }    
                if(newUnit > this.choppedNumber) {
                  if(DEBUG) console.log("MAIOR QUE CHOPPEDNUMBER2")
                  return;
                } 

            
                if(newUnit === x) {
                  let foundBlank = false;
                  for(let unit = 0 ; unit < this.choppedNumber; unit++){
                    if(this.tecladoReplicant.teclas[y][unit] === "" && unit !== x){
                      foundBlank = true;
                      newUnit = unit;
                      break;
                    }
                  }

                  if(!foundBlank && numberOfElements !== this.choppedNumber) {
                    if(DEBUG) console.log('nElements: ' + numberOfElements);
                    if(DEBUG)  console.log("!foundBlank");
                    return;
                  } 
                
                } 
                

                rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);

                if(DEBUG) console.log("LOCUS: ");
                if(DEBUG) console.log(sElContent[rearrangedFormula]);

                sElContent[rearrangedFormula].appendChild(copy);

                this.tecladoReplicant.teclas[y][newUnit] = this.tecladoReplicant.teclas[y][uCol];
                this.tecladoReplicant.teclas[y][uCol] = "";
                this.tecladoReplicant.action[y][newUnit] = this.tecladoReplicant.action[y][uCol];
                this.tecladoReplicant.action[y][uCol] = "";
                this.tecladoReplicant.text[y][newUnit] = this.tecladoReplicant.text[y][uCol];
                this.tecladoReplicant.text[y][uCol] = "";
                this.tecladoReplicant.image[y][newUnit] = this.tecladoReplicant.image[y][uCol];
                this.tecladoReplicant.image[y][uCol] = "";

              }
          }
      }


        /**
       * Preparation method for a recursive mapping method.
       *
       * @method  mapToNewFormula
       * @param x {number} x position of the input image
       * @param y {number} y position of the input image
       * @param receptacle {number} size of the receptacle array
       * @param inverse {boolean} to decide if return an inverse mapping
       * @returns void {void} 
      * @public
       */
      private mapToNewFormula(x: number, y: number, receptacle: number, inverse?: boolean):number{
            let DEBUG = false;                                                      

            // Arrays preparation phase
            let originalArray = new Array();
            let joinOriginalArray = new Array();
            let joinReceptacleArray = new Array();
            let receptacleArray = new Array();
            for(let unit = 0; unit < 14; unit++){
              originalArray.push(unit);
              joinReceptacleArray.push('');
              joinOriginalArray.push('');
            }
            for(let unit = 0; unit < receptacle; unit++){
              receptacleArray.push(unit)
            }           
 
 
            this.mapToNewRecursive(x, y, originalArray, receptacleArray, joinOriginalArray, joinReceptacleArray, false, false, DEBUG);

            if(DEBUG) console.log("************************************");
            
            if(DEBUG) console.log('ORIGINAL: ' + joinOriginalArray.length);
            if(DEBUG) console.log('RECEPTACLE: ' + joinReceptacleArray.length);
            if(DEBUG) console.log("FINAL JOINS:")
            if(DEBUG) console.log(JSON.stringify(joinOriginalArray) )
            if(DEBUG) console.log(JSON.stringify(joinReceptacleArray) )

            for(let original = 0; original < joinOriginalArray.length; original++){
                
                 if(DEBUG) console.log(joinOriginalArray[original] + ' ----> ' + x)
                 if(DEBUG) console.log(joinReceptacleArray[original] + ' **** ' + x)  
                if(joinOriginalArray[original].toString() === x.toString()){
                  if(joinReceptacleArray[original] === undefined || joinReceptacleArray[original] === null){
                    for(let unit = 0; unit < joinReceptacleArray.length; unit++){
                      if(joinReceptacleArray[unit] !== null) return joinReceptacleArray[unit];    
                    }
                  }  
                  if(DEBUG) console.log('VALOR ACHADO:')
                  if(DEBUG) console.log(JSON.stringify(joinReceptacleArray[original] ) )
                  if(inverse){
                    return joinOriginalArray[original];  
                  } else {
                    return joinReceptacleArray[original];
                  }  
                }
            }

      }

        /**
       * This functions use a divide-and-conquer method to separate the centers and extremes recursevely of the original array and maps its position to the positions 
       * of an smaller array called receptacle array. In the end it sets the final mapping array for creating a ilusion of congruence in the positioning of the image keys.
       *
       * @method  mapToNewRecursive
       * @param x {number} x position of the input image
       * @param y {number} y position of the input image
       * @param originalArray {Array<any>} the array containing the original positions 
       * @param receptacleArray {Array<any>} the array containing the positions to be mapped from originalArray
       * @param joinOriginalArray {Array<any>} the final mapping of the original array
       * @param joinReceptacleArray {Array<any>} the final mapping of the receptacle array
       * @param left {boolean} indicates if the recursion is coming from the left side
       * @param right {boolean} indicates if the recursion is coming from the right side
       * @param DEBUG {boolean} for debug purposes
       * @returns void {void} 
       * @public
       */
      private mapToNewRecursive(x: number, y: number, originalArray: Array<any>, receptacleArray: Array<any>, joinOriginalArray: Array<any>,
           joinReceptacleArray: Array<any>, left: boolean, right: boolean, DEBUG: boolean){
        let copyOriginal = originalArray.slice(), copyReceptacle = receptacleArray.slice();
        
        if(DEBUG) console.log('------------------------------')
        if(DEBUG) console.log("ORIGINAL:")
        if(DEBUG) console.log(JSON.stringify(originalArray) )
        if(DEBUG) console.log("RECEPTACLE:")
        if(DEBUG) console.log(JSON.stringify(receptacleArray) )

        if(DEBUG)  console.log("JOINS:")
        if(DEBUG) console.log(JSON.stringify(joinOriginalArray) )
        if(DEBUG) console.log(JSON.stringify(joinReceptacleArray) )
        

        // copying extremes
        joinOriginalArray[originalArray[0]] = originalArray[0];
        joinOriginalArray[originalArray[originalArray.length-1]] = originalArray[originalArray.length-1];

        joinReceptacleArray[originalArray[0]] = receptacleArray[0];
        joinReceptacleArray[originalArray[originalArray.length-1]] = receptacleArray[receptacleArray.length-1];
        
        // copying the centers
          let originalIsEven, receptacleIsEven;
          let originalCenter, originalLowCenter, originalHighCenter, originalUniqueCenter = undefined;
          let receptacleCenter, receptacleLowCenter, receptacleHighCenter, receptacleUniqueCenter = undefined;

          //check if original has even lenght
          if(originalArray.length % 2 === 0 && originalArray.length !== 0){
            // even
            originalIsEven = true;
            originalLowCenter = originalArray[Math.floor((originalArray.length-1)/2)];
            originalHighCenter = originalArray[Math.ceil((originalArray.length-1)/2)];

            if(joinOriginalArray[originalLowCenter] !== '' && joinOriginalArray[originalHighCenter] !== '') {console.log('MARK1'); return;}
            joinOriginalArray[originalLowCenter] = originalArray[originalLowCenter];
            joinOriginalArray[originalHighCenter] = originalArray[originalHighCenter];
          } else {
            // odd
            originalIsEven = false;
            
            if(originalArray.length > 1){
              originalUniqueCenter = originalArray[Math.floor((originalArray.length-1)/2)];

              if(joinOriginalArray[originalUniqueCenter] !== '') {console.log('MARK2'); return;}
              
              

              for(let unit = 0; unit < copyOriginal.length; unit++){
                if(copyOriginal[unit] === originalUniqueCenter){
                  joinOriginalArray[originalUniqueCenter] = originalArray[unit];  
                  break;
                }
              }              

            
            } else {
                  if(DEBUG) console.log('VALOR DENTRO DO ARRAY: ' + originalArray[0])
                  if(joinOriginalArray[originalArray[0]] !== "") return;    
                  joinOriginalArray[originalArray[0]] = originalArray[0];  
            }
            
        
          }
        
          //check if receptacle has even lenght
          if(receptacleArray.length % 2 === 0 && receptacleArray.length !== 0){
            // even
            receptacleIsEven = true;
            receptacleLowCenter = receptacleArray[Math.floor((receptacleArray.length-1)/2)];
            receptacleHighCenter = receptacleArray[Math.ceil((receptacleArray.length-1)/2)];


            if(originalIsEven){
              if(joinReceptacleArray[originalLowCenter] !== '' && joinReceptacleArray[originalHighCenter] !== '') {console.log('MARK4'); return;}
              joinReceptacleArray[originalLowCenter] = receptacleArray[receptacleLowCenter];
              joinReceptacleArray[originalHighCenter] = receptacleArray[receptacleHighCenter];  
            } else {
              joinReceptacleArray[receptacleArray[0]] = receptacleArray[0];
            }
            
          } else {
            receptacleIsEven = false;
            // odd

            if(receptacleArray.length > 1){
                  receptacleUniqueCenter = receptacleArray[Math.floor((receptacleArray.length-1)/2)];
                if(originalIsEven){
                  if(joinReceptacleArray[originalLowCenter] !== '' && joinReceptacleArray[originalHighCenter] !== '') {console.log('MARK5'); return;}

                  joinReceptacleArray[originalLowCenter] = receptacleArray[receptacleUniqueCenter];
                  joinReceptacleArray[originalHighCenter] = receptacleArray[receptacleUniqueCenter];
                } else {
                  if(joinReceptacleArray[originalUniqueCenter] !== '') {console.log('MARK6'); return;}
                  
                  if(left) joinReceptacleArray[originalUniqueCenter] = receptacleArray[receptacleUniqueCenter-1];
                  if(right)joinReceptacleArray[originalUniqueCenter] = receptacleArray[receptacleUniqueCenter-(receptacleUniqueCenter-1)];
                }
            } else {
              joinReceptacleArray[originalUniqueCenter] = receptacleArray[0];
            }
            
            
          }

          if(DEBUG) console.log("ALTERED JOINS:")
          if(DEBUG) console.log(JSON.stringify(joinOriginalArray) )
          if(DEBUG) console.log(JSON.stringify(joinReceptacleArray) )
          

            ////////////////////////////////////////
           ////  CORTE ESQUERDO      //////////////
          ////////////////////////////////////////
          
          let leftOriginalArray, leftReceptacleArray;
          ////////
          //Left Side
          if(originalIsEven && copyOriginal.length > 1){
          
            for(let unit = 0; unit < copyOriginal.length; unit++){
              if(copyOriginal[unit] === originalLowCenter){
                leftOriginalArray = copyOriginal.slice(1, unit);
                break;
              }
            }

          } else if (!originalIsEven && copyOriginal.length > 1){
            
            if(DEBUG) console.log("UNIQUE CENTER: " + originalUniqueCenter)

            for(let unit = 0; unit < copyOriginal.length; unit++){
              if(copyOriginal[unit] === originalUniqueCenter){
                leftOriginalArray = copyOriginal.slice(1, unit);
                break;
              }
            }


          }else {
            leftOriginalArray = originalArray;
          }

          if(receptacleIsEven && copyReceptacle.length > 1){
          
            for(let unit = 0; unit < copyReceptacle.length; unit++){
              if(copyReceptacle[unit] === receptacleLowCenter){
                leftReceptacleArray = copyReceptacle.slice(1, unit);
                break;
              }
            }
            

          } else if (!receptacleIsEven && copyReceptacle.length > 1){
            if(DEBUG) console.log('R UNIQUE CENTER: ' + receptacleUniqueCenter)
            for(let unit = 0; unit < copyReceptacle.length; unit++){
              if(copyReceptacle[unit] === receptacleUniqueCenter){
                leftReceptacleArray = copyReceptacle.slice(1, unit+1);
                if(DEBUG) console.log(unit);
                break;
              }
            }
           
 
          } else {
            leftReceptacleArray = receptacleArray;
          }


            ////////////////////////////////////////
           ////  CORTE DIREITO       //////////////
          ////////////////////////////////////////

           let rightOriginalArray, rightReceptacleArray; 
           if(originalIsEven && copyOriginal.length > 1){

             rightOriginalArray = copyOriginal.slice(originalHighCenter+1, copyOriginal.length-1);
 
           } else if (!originalIsEven && copyOriginal.length > 1){
            if(DEBUG) console.log("UNIQUE CENTER: " + originalUniqueCenter)
             
             for(let unit = 0; unit < copyOriginal.length; unit++){
              if(copyOriginal[unit] === originalUniqueCenter){
                rightOriginalArray = copyOriginal.slice(unit+1, copyOriginal.length-1);
                if(DEBUG) console.log(unit);
                break;
              }
            }
 
           }else {
             rightOriginalArray = originalArray;
           }
           
           if(receptacleIsEven && copyReceptacle.length > 1){

             rightReceptacleArray = copyReceptacle.slice(receptacleHighCenter+1, copyReceptacle.length-1);

           } else if (!receptacleIsEven && copyReceptacle.length > 1){
            if(copyReceptacle.length === 3 ) {

              rightReceptacleArray = copyReceptacle.slice(1,2);

            } else {

                rightReceptacleArray = copyReceptacle.slice(receptacleUniqueCenter+1, copyOriginal.length-1);
            }   
  
           } else {
             rightReceptacleArray = receptacleArray;
           }


           if(DEBUG) console.log("SLICED LEFT ORIGINAL:")
           if(DEBUG) console.log(JSON.stringify(leftOriginalArray) )
           if(DEBUG) console.log("SLICED LEFT RECEPTACLE:")
           if(DEBUG) console.log(JSON.stringify(leftReceptacleArray) )
          
          
          let foundReceptacleEmpty = false
          for(let unit = 0; unit < joinReceptacleArray.length; unit++){
            if(joinReceptacleArray[unit] === '' ){
              foundReceptacleEmpty = true;
              break;
            } 
          }

          let foundOriginalEmpty = false
          for(let unit = 0; unit < joinOriginalArray.length; unit++){
            if(joinOriginalArray[unit] === '' ){
              foundOriginalEmpty = true;
              break;
            } 
          }
          
          //base da recursão
          if( !foundOriginalEmpty && !foundReceptacleEmpty && leftOriginalArray.length <= 1 && leftReceptacleArray.length <= 1) return;
        
          //LEFT RECURSION
          if(DEBUG) console.log("RECURSION LEFT")
          this.mapToNewRecursive(x, y, leftOriginalArray, leftReceptacleArray, joinOriginalArray, joinReceptacleArray, true, false, DEBUG);
          if(DEBUG) console.log("BACK FROM RECURSION LEFT")


          if(DEBUG) console.log("BEFORE SLICE RIGHT ORIGINAL:")
          if(DEBUG) console.log(JSON.stringify(copyOriginal) )
          if(DEBUG) console.log("BEFORE SLICE RIGHT RECEPTACLE:")
          if(DEBUG) console.log(JSON.stringify(copyReceptacle) )

          if(DEBUG) console.log("SLICED RIGHT ORIGINAL:")
          if(DEBUG) console.log(JSON.stringify(rightOriginalArray) )
          if(DEBUG) console.log("SLICED RIGHT RECEPTACLE:")
          if(DEBUG) console.log(JSON.stringify(rightReceptacleArray) )

          foundReceptacleEmpty = false
          for(let unit = 0; unit < joinReceptacleArray.length; unit++){
            if(joinReceptacleArray[unit] === '' ){
              foundReceptacleEmpty = true;
              break;
            } 
          }

          foundOriginalEmpty = false
          for(let unit = 0; unit < joinOriginalArray.length; unit++){
            if(joinOriginalArray[unit] === '' ){
              foundOriginalEmpty = true;
              break;
            } 
          }

          //base da recursão
          if( !foundOriginalEmpty && !foundReceptacleEmpty && rightOriginalArray.length <= 1 && rightReceptacleArray.length <= 1) return;

          //RIGHT RECURSION
          if(DEBUG) console.log("RECURSION RIGHT")
          this.mapToNewRecursive(x, y, rightOriginalArray, rightReceptacleArray, joinOriginalArray, joinReceptacleArray, false, true, DEBUG);
          if(DEBUG) console.log("BACK FROM RECURSION RIGHT")
     
      }


        /**
       * Finds a element whithin a dragula unit array.
       *
       * @method  indElement
       * @param sElContent {number} array of dragula units
       * @param x {number} x position of the searched unit
       * @param y {number} y position of the searched unit
       * @returns el {number} 
       * @public
       */
      public findElement(sElContent, x: number , y: number){

        for(let el = 0; el < sElContent.length; el++){

          if($(sElContent)[el].className.split(' ')[0].split('#')[0].toString() === y.toString() &&
               $(sElContent)[el].className.split(' ')[0].split('#')[1].toString() === x.toString()){
                return el;
          }
        }
        
      }


        /**
       * Change line size to original or to the image size.
       *
       * @method changeLineSize
       * @param targetY {number} target line to change size
       * @param config {string} 'default' indicates that the line should change to original conditions, and 'imgSize' to expand it to image size.
       * @returns el {number} 
       * @public
       */
      public changeLineSize(targetY: number, config: string){
        let sElContent = $("[id=content]");
        let sElLines = $("[id=blankLines]");
        let sElRows = $("[id=blankRows]");
        let sElNone = $("[id=blankNone]");

        if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize*this.scale;
        if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize*this.scale;



        if(config === 'default'){

                for(let col=0; col < this.globColumnQnty ; col++){
                  
                    let formula = this.globColumnQnty*Number(targetY)+Number(col);

                    $($(sElContent)[formula]).css('visibility', 'visible');
                    $($(sElContent)[formula]).css('height', this.keysHeightSize);
                    if(this.growthFactor > 1 ){
                      if(this.smallerScreenSize){
                        $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal-15);    
                      } else {
                        $($(sElContent)[formula]).css('width', this.keysWidthSize/this.growthFactor);  
                      }
                      
                    } else {
                      if(this.smallerScreenSize){
                        $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal-15);
                      } else {
                        $($(sElContent)[formula]).css('width', this.keysWidthSize);
                      }
                      
                    }
                    
         
                    $($(sElLines)[targetY]).css('height', this.keysHeightSize);
                    $($(sElRows)[targetY]).css('height', this.keysHeightSize);
   
                    $($(sElLines)[targetY]).css('margin-bottom', 4 );
                    $($(sElRows)[targetY]).css('margin-bottom', 4 );
                }    




        } else if( config === 'imgSize'){

               
              
                  for(let col=0; col < this.globColumnQnty ; col++){
                    
                  let formula = this.globColumnQnty*Number(targetY)+Number(col);

  
                  $($(sElContent)[formula]).css('width', this.keysWidthSize);
     

                  if(this.ENABLE_TEXT_MODE){
                    $($(sElContent)[formula]).css('height', this.imgMaxHeightSize + this.textModeFactor);    
                    $($(sElLines)[targetY]).css('height', this.imgMaxHeightSize + this.textModeFactor );
                    $($(sElRows)[targetY]).css('height', this.imgMaxHeightSize + this.textModeFactor); 

                    $($(sElLines)[targetY]).css('margin-bottom', 4 + this.textModeMarginFactor );
                    $($(sElRows)[targetY]).css('margin-bottom', 4 + this.textModeMarginFactor);
                  } else {
                    $($(sElContent)[formula]).css('height', this.imgMaxHeightSize);  
                    $($(sElLines)[targetY]).css('height', this.imgMaxHeightSize);
                    $($(sElRows)[targetY]).css('height', this.imgMaxHeightSize); 

                    $($(sElLines)[targetY]).css('margin-bottom', 4 * (1+this.scale));
                    $($(sElRows)[targetY]).css('margin-bottom', 4 * (1+this.scale));
                  }
                  

              }    
       
              for(let line = 0 ; line < this.tecladoReplicant.teclas.length; line++){
                for(let col = 0 ; col < this.tecladoReplicant.teclas[line].length; col++){
                  let formula = this.globColumnQnty*Number(line)+Number(col);

                  if( col >= this.choppedNumber && this.imgLinesArray.includes(line)){
                          $($($(sElContent)[formula])[0]).css('visibility', 'hidden');
                          
                        }
      
                }
              }
        }      
      }  


        /**
       * Sets a image as background inside a dragula unit and configures it.
       *
       * @method changeDragulaBackground
       * @param el {any} dragula unit to be changed  
       * @param url {string} image background url
       * @param height {number} image height
       * @param width {number} image width
       * @param percentX {number} percentual that images occupies in x axis
       * @param percentY {number} percentual that images occupies in y axis
       * @returns void {void} 
       * @public
       */
      public changeDragulaBackground(el: any, url:string, height: number, width: number, percentX:number, percentY:number){

        el.css("background", "url("+ url +") no-repeat");
  
        let params = <string>(percentX + '% ' + percentY + '%');
        el.css("background-size", params);
 
        let percent = (((this.keysWidthSize-width)/2)/this.keysWidthSize)*100;

        el.css('background-position' , 'center center');

        el.css("transform", 'translateX('+ percent +'%)');
        

        el.css("height", height);
        el.css("width", width);

      }

      /**
       * Check if line of index Y has an image on it.
       *
       * @method checkLineHasImage
       * @param Y {number} line index
       * @returns boolean {boolean} 
       * @public
       */

      public checkLineHasImage(Y: number) {
    
        for(let z = 0; z < this.tecladoReplicant.teclas[Y].length; z++){

             if(this.tecladoReplicant.teclas[Y][z].split('$')[0] === '*img'){

              return true;
            } 
          
          }

          return false;
    }

      
}
