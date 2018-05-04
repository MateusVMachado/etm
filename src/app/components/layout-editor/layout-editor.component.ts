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
      //console.log(availHeight + 'x' + availWidht );
      //if(availHeight === 728 && availWidht === 1024){
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

      //Initializing OldPositions Array
      // for(let unit = 0; unit < this.globColumnQnty; unit++){
      //   this.oldPositions = [];
      //   this.oldPositions[unit] = '';
      // }

      this.keyboardContainerSize = $(document.getElementsByClassName('teclado-container-editor')).width();
      
      this.keysWidthSize = (this.keyboardContainerSize - (this.globColumnQnty*5.5) )/this.globColumnQnty;
      
      //PARA IMAGENS MAIORES
      if(this.IMAGE_TESTE) {
        //this.growthFactor = 1.5;
        //this.growthFactor = 1.85;
        this.scale = this.availWidth/ 1920;
        
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
               self.tecladoReplicant.image[i][j] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
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

  public alterImgSize(){
    // let sElContent = $('[id=content]');
    // for(let x = 0; x< this.teclado.teclas.lenght; x++){
    //   for(let y = 0; y< this.teclado.teclas[x].lenght; y++){
    //     if(this.teclado.teclas[x][y].split('$')[0] === '*img'){
    //       let formula = this.globColumnQnty*Number(y)+Number(x);
    //       this.changeLineSize(y, '')
    //     }
    //   }
    // }

    // for(let unit = 0; unit < sElContent.length; unit++){
    //   $($(sElContent)[unit]).css('font-size',  18*this.growthTextFactor);
    // }
  }  

  public alterFontSize(){
    let sElContent = $('[id=content]');
    for(let unit = 0; unit < sElContent.length; unit++){
      $($(sElContent)[unit]).css('font-size',  18*this.growthTextFactor);
    }
  }

  public getRandomColor() {
      let letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }


    private newCheckRound(){
      this.cdr.detectChanges();
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


        /////////////////////////////
     ///////////////////////////////////////////////////////
    // LOAD DO TECLADO VIA COPY DOS ELEMENTOS DO DRAGULA //
   ///////////////////////////////////////////////////////
    ////////////////////////////


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

          //console.log(JSON.stringify(replicantFromDatabase));
          if(replicantFromDatabase.magnify !== undefined ||  replicantFromDatabase.magnify !== null){
            this.growthTextFactor = Number(replicantFromDatabase.magnify);
            if(this.growthTextFactor === 0.0) this.growthTextFactor = 1.0;
          } else {
            this.growthTextFactor = Number(1.0.toFixed(2));
          }
          

      this.imgLinesArray = [];

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
                let formula = this.globColumnQnty*Number(x)+Number(y);
                //el1 = sEl[formula].cloneNode(true);
                el1 = sEl[0].cloneNode(true);
                
              }
              
        
                      if(!$(el1).find('input')[0]){
        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] !== '*img') {
                          $($(el1).find('button')[0]).attr('value', replicantFromDatabase.teclas[x][y]);
                      
                          //$(el1).find('button')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                        }  

                        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] === '*img'){
                          if(!this.imgLinesArray.includes(x.toString())) this.imgLinesArray.push( Number(x) );

                          let height = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[0];
                          let width = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[1];
                          this.imgMaxHeightSize = height;
                          this.imgMaxWidthSize = width;

                          this.changeDragulaBackground( $($(el1)), replicantFromDatabase.image[x][y], height, width, 100, 100);
                          //$($(el1).find('button')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
                          $($(el1).find('button')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
                          //$(el1).find('button')[0].className = 'tamanho-button-especial-big' + ' ' + y + '#' + x + '';
                          $($(el1).find('button')[0]).attr('display', 'none');
                            if(this.checkLineHasImage(x)){
  
                              this.changeLineSize(x, 'imgSize');
                            }
                            //this.changeLineSize2(x, 'imgSize');  

                        }
                        
                        
                      }  else {
                        
                        if(replicantFromDatabase.teclas[x][y].split('$')[0] !== '*img') {
                            $($(el1).find('input')[0]).attr('value', replicantFromDatabase.teclas[x][y]);
                           
                           // $(el1).find('input')[0].className = 'tamanho-button-especial-full' + ' ' + y + '#' + x + '';
                        }    
                        


                        if(replicantFromDatabase.teclas[x][y].split('$')[0] === '*img'){
                          if(!this.imgLinesArray.includes(x.toString())) this.imgLinesArray.push( Number(x) );

                          let height = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[0];
                          let width = replicantFromDatabase.teclas[x][y].split("$")[1].split('#')[1];
                          this.imgMaxHeightSize = height;
                          this.imgMaxWidthSize = width;

                          this.changeDragulaBackground( $(el1), replicantFromDatabase.image[x][y], height, width, 100, 100);
                          //$($(el1).find('input')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
                          $($(el1).find('input')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
                          //$(el1).find('input')[0].className = 'tamanho-button-especial-big' + ' ' + y + '#' + x + '';
                          $($(el1).find('input')[0]).attr('display', 'none');

                          if(this.checkLineHasImage(x)){
  
                            this.changeLineSize(x, 'imgSize');
                          }
                          
                          //this.changeLineSize2(x, 'imgSize');

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

      keyboard.type = layout.nameLayout;
      keyboard.magnify = layout.magnify;

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


    
        /////////////////////////////
     //////////////////////////////
    // EVENTO REMOVE DO DRAGULA //
   //////////////////////////////
    ////////////////////////////


    private onRemove(value){
      console.clear();
      console.log("-------------------REMOVE---------------------")
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


      //console.log('sourceY: ' + sourceY);


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

                }
              }
              if(DEBUG) console.log(found);
              if(DEBUG) console.log(this.count);
              
              if(!found || this.count >= 1){
                if(DEBUG) console.log("MARK5");
                //if(this.imgLinesArray.includes(sourceY.toString())){
                  if(DEBUG) console.log('SOURCE: ' + sourceY);
                  //index = this.imgLinesArray.indexOf[sourceY];
                  for(let i = 0; i < this.imgLinesArray.length; i++){
                    if(this.imgLinesArray[i] === sourceY){
                      if(DEBUG) console.log("MARK6");
                      
                      index = i;
                      break;
                    }
                  //}

                  if(DEBUG)  console.log('INDEX: ' + index);

                  console.log("NO REMOVE:")
                  console.log("ANTES DO CORTE:")
                  console.log(JSON.stringify(this.imgLinesArray))
                  this.imgLinesArray.splice(index, 1);
                  

                  console.log("DEPOIS DO CORTE:")
                  console.log(JSON.stringify(this.imgLinesArray))
                  break;
                  //console.log(JSON.stringify(this.imgLinesArray));
                }
              }
              
              if(DEBUG) console.log("MARK7");
              found = false;

      }        

      if(isImage){
          if(!this.checkLineHasImage(sourceY)){
            //console.log("ATIVOU DEFAULT 5")
            //console.log('SIZE CHANGER X2');
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
 
      console.log(JSON.stringify(this.imgLinesArray) )
      console.log(JSON.stringify(this.tecladoReplicant.teclas))
      console.log(JSON.stringify(this.tecladoReplicant.action))
      console.log(JSON.stringify(this.tecladoReplicant.text))


    }  



    
        /////////////////////////////
     ////////////////////////////
    // EVENTO DROP DO DRAGULA //
   ////////////////////////////
    ////////////////////////////

    private onDrop(value) {
      console.clear();
      console.log("-------------------DROPS---------------------")
      console.log(JSON.stringify(this.tecladoReplicant.teclas));
      //console.clear();
      let DEBUG = false;


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
  
            
         
            console.log("imgLINES ANTES DO CORTE:")
            console.log(JSON.stringify(this.imgLinesArray))

            if(this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] === '*img'){
              this.imgLinesArray.splice(this.cutIndex, 1);
            }
          // if(! $($(value[1])[0]).find('button')[0] && isContent && $($(value[1])[0]).find('input')[0] !== undefined){
          //   if(DEBUG) console.log("MARK-NEWDROP-2");
          //     if( $($(value[1])[0]).find('input')[0].className.split(' ')[0] === 'tamanho-button-especial-big' ){
          //       if(DEBUG) console.log("MARK-NEWDROP-3");
   
          //         if($($(value[1])[0].attributes)[4]){  
          //           if(DEBUG) console.log("MARK-NEWDROP-4");
          //           if(sourceY !== drainY && !isCopy && $($(value[1])[0].attributes)[4].textContent.substring(0,10) === 'background') {
          //             if(DEBUG) console.log("MARK-NEWDROP-5");
          //             console.log("SPLICE 1");
          //             this.imgLinesArray.splice(this.cutIndex, 1);
          //           }
          //         }   
          //     }
          // } else if(! $($(value[1])[0]).find('input')[0] && isContent && $($(value[1])[0]).find('button')[0] !== undefined) {
          //   if(DEBUG) console.log("MARK-NEWDROP-6");
          //   if( $($(value[1])[0]).find('button')[0].className.split(' ')[0] === 'tamanho-button-especial-big' ){
              
          //     if(DEBUG) console.log("MARK-NEWDROP-7");
          //     if(sourceY !== drainY && !isCopy && $($(value[1])[0].attributes)[4].textContent.substring(0,10) === 'background') {
          //       if(DEBUG) console.log("MARK-NEWDROP-8");
          //       console.log("SPLICE 2");

          //       this.imgLinesArray.splice(this.cutIndex, 1);
          //     }  
          //   }
          // }     
     



          console.log("imgLINES DEPOIS DO CORTE:")
          console.log(JSON.stringify(this.imgLinesArray))

          if(DEBUG) console.log("MARK-NEWDROP-1A");
          //console.log(this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0])
         // console.log(JSON.stringify(this.tecladoReplicant.teclas) ) 

          if(this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] === '*img' && drainY !== sourceY){


            if(DEBUG) console.log("MARK-NEWDROP-9");
              

            let derivedX = drainX;

            if(this.choppedNumber !== this.globColumnQnty){
              if(DEBUG) console.log("MARK-NEWDROP-10");
              let found = false;
              for(let unit = 0; unit < this.imgLinesArray.length; unit++){
                //console.log(this.imgLinesArray[unit] + ' ####> ' + drainY)
                if(this.imgLinesArray[unit].toString() === drainY.toString()){
                  found = true;
                  break;
                }
              }


                  
                    if(!found){
                      if(DEBUG) console.log("MARK-NEWDROP-11");
                        let sElContentTmp = $('[id=content]');
                        //sElContentTmp[0] = $(value[1])[0];
                        let el = $(value[1])[0].cloneNode(true);
                        $(value[1])[0].remove();
  
                        
      
                        //console.log("RECURSÃO ATIVADA NO DROP");
                        derivedX = this.mapToNewFormula(drainX, drainY, this.choppedNumber,false);//
                      

                        let formula = this.globColumnQnty*Number(drainY)+Number(derivedX);
                        //let formula = this.globColumnQnty*Number(drainY)+Number(drainX);
                        
                        drainX = derivedX;
                        let foundBlank = false;
                        while(this.tecladoReplicant.teclas[drainY][derivedX] !== '' && derivedX < this.choppedNumber){
                          derivedX = derivedX + 1;
                        }
                        if(derivedX >= this.choppedNumber){
                          while(this.tecladoReplicant.teclas[drainY][derivedX] !== '' && derivedX > 0){
                            derivedX = derivedX - 1;
                          }

                          if(derivedX <= 0){
                            //console.log("MENOR OU IGUAL A ZERO")
                            formula = this.globColumnQnty*Number(sourceY)+Number(sourceX);
                            sElContentTmp[formula].appendChild(el);
                            return;
                          }
                        }


                        formula = this.globColumnQnty*Number(drainY)+Number(derivedX);
                        sElContentTmp[formula].appendChild(el);
                        
  
                  }     
        
            }

            drainX = derivedX
            // console.log("PUSH 1");
             this.imgLinesArray.push(Number(drainY)) ;


             console.log("imgLINES DEPOIS DO PUSH:")
             console.log(JSON.stringify(this.imgLinesArray))

              let choice = false;
  

            

              if( !this.checkLineHasImage(drainY) ) {
                if(DEBUG) console.log("MARK-NEWDROP-12");
                //console.log("MARK-DROP-1")

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
                //console.log("MARK-DROP-2")
                
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

                //console.log("MARK-DROP-3")
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
              //console.log("MARK-DROP-4")
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
                  //console.log("MARK-DROP-5")
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
                                if(DEBUG) console.log("MARK-DROP-13A");
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                                this.tecladoReplicant.teclas[drainY][drainX] = trueValue;
                 
                              
                              } else {
                                if(DEBUG) console.log("MARK-DROP-13B");
                                console.log("NO SOURCE!")
                                console.log(this.tecladoReplicant.teclas[sourceY][sourceX]);
                                console.log("NOVO DRAIN:")
                                console.log('drainX: ' + drainX + ' drainY: ' + drainY)
                                this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX];
                                this.tecladoReplicant.teclas[sourceY][sourceX] = "";
                              }
                              


                                this.tecladoReplicant.text[sourceY][sourceX] = ""; 
                                this.tecladoReplicant.text[drainY][drainX] = trueValue;
           
                                this.tecladoReplicant.action[sourceY][sourceX] = "";  

                                if(this.tecladoReplicant.image[sourceY][sourceX] !== ""){
                                  if(DEBUG) console.log("MARK-DROP-13C");
                                  this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  
                                  this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                } else {
                                  if(DEBUG) console.log("MARK-DROP-13D");
                                  //this.tecladoReplicant.image[sourceY][sourceX] = "";   ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
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
      
                                                                                                                
                                    if(DEBUG) console.log("MARK-DROP-15A");


                                    this.tecladoReplicant.teclas[drainY][drainX] = this.tecladoReplicant.teclas[sourceY][sourceX]; 
                                    this.tecladoReplicant.teclas[sourceY][sourceX] = ""; 
                                  
                                    this.tecladoReplicant.text[drainY][drainX] = this.tecladoReplicant.text[sourceY][sourceX]; 
                                    this.tecladoReplicant.text[sourceY][sourceX] = ""; 

                                    this.tecladoReplicant.action[drainY][drainX] = this.tecladoReplicant.action[sourceY][sourceX]; 
                                    this.tecladoReplicant.action[sourceY][sourceX] = "";
                                    
                                    
                                    this.tecladoReplicant.image[drainY][drainX] = this.tecladoReplicant.image[sourceY][sourceX];  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
                                    this.tecladoReplicant.image[sourceY][sourceX] = ""; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


                                } else if (isContent && isCopy){
            
                                                                                         
                                  if(DEBUG)  console.log("MARK-DROP-15B");

                                  
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
                  
                    //console.log(JSON.stringify(this.tecladoReplicant.teclas) )

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
                                
                        } else {
                          $($(sElContent)[formula]).css('height', this.imgMaxHeightSize);
                          $($(sElContent)[formula]).css('width', this.imgMaxWidthSize);
                        }      
                      }
                    } 



                    let found = false;
                    for(let x = 0 ; x < this.imgLinesArray.length; x++){
                      //console.log(this.imgLinesArray[x] + ' *** ' + drainY)
                      if(this.imgLinesArray[x].toString() === drainY.toString()){
                        found = true;
                        break;
                      }
                    }



                    // let numberOfImages = 0;
                    // for(let unit = 0; unit < this.tecladoReplicant.teclas[drainY].lenght; unit++){
                    //   if(this.tecladoReplicant.teclas[drainY][unit].split('$')[0] === '*img'){
                    //     numberOfImages += 1;
                    //   }
                    // }

                    // console.log("NO DRAIN:")
                    // console.log(this.tecladoReplicant.teclas[drainY][drainX].split('$')[0]);
                    // console.log("CHECAGEM: " + !this.checkLineHasImage(drainY))
                    
                    // if(!this.checkLineHasImage(drainY) &&  this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img'){
                    // //if(numberOfImages <= 1 &&  this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img'){
                    //     this.keysRelocation(drainX,drainY);
                    // }    

                    // console.log("****EM CIMA****")

                    // console.log("ELEMENTO NO DROP?")
                    // console.log(value[3])

                    // console.log("NO SOURCE:")
                    // console.log(this.tecladoReplicant.teclas[sourceY][sourceX].split("$")[0]);

                    let isImage = true;
                    let checagem = false;
                    // console.log("$(value[3]).find('input')[0] : " + $(value[3]).find('input')[0])
                    // console.log("$(value[3]).find('button')[0] : " + $(value[3]).find('button')[0])
                    if($($(value[1])[0].attributes)[4]){
                      if($($(value[1])[0].attributes)[4].textContent.substring(0,10) === 'background') checagem = true; 
                    }  

                    // //if($(value[3]).find('input')[0] || $(value[3]).find('button')[0] ) isImage = false; 
                    if( this.tecladoReplicant.teclas[drainY][drainX].split("$")[0] !== '*img' ) isImage = false; 
                    // //if( this.tecladoReplicant.teclas[sourceY][sourceX].split("$")[0] === '*img' ) checagem = true; 

                    // console.log('isImage: ' + isImage)
                    // console.log('checagem: ' + checagem)

                    // let isBiggerThanChopped = false;
                    // console.log("TAMANHO: " + this.tecladoReplicant.teclas[drainY].lenght)
                    // for(let unit = 0; unit < this.globColumnQnty; unit++){
                    //   console.log('key: ' + this.tecladoReplicant.teclas[drainY][unit] + ' unit: ' + unit + 'this.choppedNumber: ' + this.choppedNumber)
                    //   if(this.tecladoReplicant.teclas[drainY][unit] !== '' && unit >= this.choppedNumber){
                    //     console.log("achou!")
                    //     isBiggerThanChopped = true;
                    //     break;
                    //   }
                    // }
                    
                    // console.log(isBiggerThanChopped)

      
                      if(!this.checkLineHasImage(drainY) && isImage){
                        //this.keysRelocation(drainX, drainY);
                        console.log(this.choppedNumber)
                      }
              

                      

                    // if(!this.checkLineHasImage(drainY)){
                    //     this.keysRelocation(drainX, drainY);
                    // } 
                    // if( (!this.checkLineHasImage(drainY) )  &&
                    // (this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img' || 
                    //  this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] === '*img') ){
                    //   if(DEBUG) console.log("MARK-NEWDROP-21");
                    //     this.keysRelocation(drainX,drainY);
                    // }      
                      console.log(JSON.stringify(this.imgLinesArray))

                    console.log(JSON.stringify(this.tecladoReplicant.teclas))
                    console.log(JSON.stringify(this.tecladoReplicant.action))
                    console.log(JSON.stringify(this.tecladoReplicant.text))


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

                    this.changeLineSize(sourceY, 'default');
                  } else {
                    this.changeLineSize(sourceY, 'imgSize');
                  }
              

                  this.adjustLinesSizes(drainY, drainX, sourceY, sourceX);
                  //console.log(JSON.stringify(this.tecladoReplicant.teclas) )
              
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
                    //console.log(this.imgLinesArray[x] + ' *** ' + drainY)
                    if(this.imgLinesArray[x].toString() === drainY.toString()){
                      found = true;
                      break;
                    }
                  }


                    // let numberOfImages = 0;
                    // for(let unit = 0; unit < this.tecladoReplicant.teclas[drainY].lenght; unit++){
                    //   if(this.tecladoReplicant.teclas[drainY][unit].split('$')[0] === '*img'){
                    //     numberOfImages += 1;
                    //   }
                    // }

                    // console.log("NO DRAIN:")
                    // console.log(this.tecladoReplicant.teclas[drainY][drainX].split('$')[0]);
                    // console.log("CHECAGEM: " + !this.checkLineHasImage(drainY))
                    
                    // if($($(value[1])[0].attributes)[4]) console.log($($(value[1])[0].attributes)[4].textContent.substring(0,10) )

                    // //$($(value[1])[0].attributes)[4].textContent.substring(0,10) === 'background'

                    // console.log("****EM BAIXO****")


                    // if(!this.checkLineHasImage(drainY) &&  this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img'){
                    // //if(numberOfImages <= 1 &&  this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img'){

                    //     this.keysRelocation(drainX,drainY);
                    // }   
                    
                    // console.log("ELEMENTO NO DROP?")
                    // console.log(value[3])

                    let isImage = true;
                    let checagem = false;
                    // console.log("$(value[3]).find('input')[0] : " + $(value[3]).find('input')[0])
                    // console.log("$(value[3]).find('button')[0] : " + $(value[3]).find('button')[0])
                    if($($(value[1])[0].attributes)[4]){
                      if($($(value[1])[0].attributes)[4].textContent.substring(0,10) === 'background') checagem = true; 
                    }  

                    // //if($(value[3]).find('input')[0] || $(value[3]).find('button')[0] ) isImage = false; 
                    if( this.tecladoReplicant.teclas[drainY][drainX].split("$")[0] !== '*img' ) isImage = false; 
                    // //if( this.tecladoReplicant.teclas[sourceY][sourceX].split("$")[0] === '*img' ) checagem = true; 

                    // console.log('isImage: ' + isImage)
                    // console.log('checagem: ' + checagem)

                    // let isBiggerThanChopped = false;
                    // console.log("TAMANHO: " + this.tecladoReplicant.teclas[drainY].lenght)
                    // for(let unit = 0; unit < this.globColumnQnty; unit++){
                    //   console.log('key: ' + this.tecladoReplicant.teclas[drainY][unit] + ' unit: ' + unit + 'this.choppedNumber: ' + this.choppedNumber)
                    //   if(this.tecladoReplicant.teclas[drainY][unit] !== '' && unit >= this.choppedNumber){
                    //     console.log("achou!")
                    //     isBiggerThanChopped = true;
                    //     break;
                    //   }
                    // }
                    
                    // console.log(isBiggerThanChopped)

      
                      if(!this.checkLineHasImage(drainY) && isImage){
                        //this.keysRelocation(drainX, drainY);
                        console.log(this.choppedNumber)
                      }
                     


                  //   if(!this.checkLineHasImage(drainY)){
                  //     this.keysRelocation(drainX, drainY);
                  // } 

                    // if(!this.checkLineHasImage(drainY) && isImage){
                    //   this.keysRelocation(drainX, drainY);

                    // }

                    
                  // if( (!this.checkLineHasImage(drainY) )  &&
                  // (this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img' || 
                  //  this.tecladoReplicant.teclas[sourceY][sourceX].split('$')[0] === '*img') ){
                  //   if(DEBUG) console.log("MARK-NEWDROP-22");
                  //     this.keysRelocation(drainX,drainY);
                  // }    

                  console.log(JSON.stringify(this.imgLinesArray))

                  console.log(JSON.stringify(this.tecladoReplicant.teclas))
                  console.log(JSON.stringify(this.tecladoReplicant.action))
                  console.log(JSON.stringify(this.tecladoReplicant.text))
                  
             
    }    

    
        /////////////////////////////
     //////////////////////////////////////
    // FAZ AJUSTE DO TAMANHO DAS LINHAS //
   //////////////////////////////////////
    ////////////////////////////


    private adjustLinesSizes(drainY: number, drainX: number, sourceY: number, sourceX: number){
                //console.log(JSON.stringify(this.imgLinesArray));
                //console.log(this.tecladoReplicant.teclas[drainY][drainX].split('$')[0]);
                //if(!this.checkLineHasImage(drainY) && this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] !== '*img'){
                  if(!this.checkLineHasImage(drainY) && this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] !== '*img'){
                      //console.log("CHANGER-1")
                        let sElContentTmp = $('[id=content]');
                        for(let step = 0 ; step < this.globColumnQnty; step++){
                          
                          let formula = this.globColumnQnty*Number(drainY)+Number(step);
      
                          // if(this.markOfRemove){
                          //   if(drainY > 0) formula = formula - Math.abs( (this.globColumnQnty*this.teclado.teclas.length) - $('[id=content]').length )
                          // }

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
                    //console.log("CHANGER-2")
                    let sElContentTmp = $('[id=content]');
                    for(let step = 0 ; step < this.globColumnQnty; step++){
                      
                      let formula = this.globColumnQnty*Number(drainY)+Number(step);

                      // if(this.markOfRemove){
                      //   if(drainY > 0) formula = formula - Math.abs( (this.globColumnQnty*this.teclado.teclas.length) - $('[id=content]').length )
                      // }

                      //console.log($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]);
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
                    //console.log("CHANGER-3")
                    
                    this.changeLineSize(sourceY, 'default');
                    let sElContentTmp = $('[id=content]');
                    for(let step = 0 ; step < this.globColumnQnty; step++){
    
                      let formula = this.globColumnQnty*Number(sourceY)+Number(step);
            
                      // if(this.markOfRemove){
                      //   if(sourceY > 0) formula = formula - Math.abs( (this.globColumnQnty*this.teclado.teclas.length) - $('[id=content]').length )
                      // }

                      if( $($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0] ){
                        $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.keysHeightSize);
                      } else {
                        $($($($(sElContentTmp)[formula]).find('div')[1]).find('button')[0]).css('height', this.keysHeightSize);
                      }
     
                    }
                  }

                  if(this.tecladoReplicant.teclas[drainY][drainX].split('$')[0] === '*img' ){
                    //console.log("CHANGER-4");
                    let sElContentTmp = $('[id=content]');
                    for(let step = 0 ; step < this.globColumnQnty; step++){
    
                      let formula = this.globColumnQnty*Number(drainY)+Number(step);
                      
                      // if(this.markOfRemove){
                      //   if(drainY > 0) formula = formula - Math.abs( (this.globColumnQnty*this.teclado.teclas.length) - $('[id=content]').length )
                      // }
                      
                      //console.log( $(sElContentTmp)[formula]);
  
                      

                      //console.log('altura: ' + this.imgMaxHeightSize);

                      if( $($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0] ){
                        //console.log("CHANGER-4-A1");
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      } else {
                        //console.log("CHANGER-4-B1")
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[0]).find('button')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      }

                      
                      if( $($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0] ){
                        //console.log("CHANGER-4-A1")
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      } else {
                        //console.log("CHANGER-4-B1")
                        if(this.ENABLE_TEXT_MODE){
                          $($($($(sElContentTmp)[formula]).find('div')[1]).find('button')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                        } else {
                          $($($($(sElContentTmp)[formula]).find('div')[1]).find('button')[0]).css('height', this.imgMaxHeightSize);  
                        }
                        
                      }

                      if( $($(sElContentTmp)[formula]).find('input')[0] ){
                        //console.log("CHANGER-4-A1")
                        if(this.ENABLE_TEXT_MODE){
                          $($($(sElContentTmp)[formula]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);
                        } else {
                          $($($(sElContentTmp)[formula]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        }
                        
                      } else {
                        //console.log("CHANGER-4-B1")
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
    
    public showModal(component){
        const activeModal = this.modalService.open(component, {size: 'lg', container: 'nb-layout'});
        this.modal = activeModal;
    }

    public closeModal(){
      this.modal.close();
      this.modal = null;
  } 

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



   
        /////////////////////////////
     ////////////////////
    // SALVAR TECLADO //
   ////////////////////
    ////////////////////////////


   public saveKeyboardLayout(saveAs?: boolean){
     //console.log('MAGNIFY: ' + this.growthTextFactor)
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

    private createEmptyKeyboard(){
      let rows = 5;
      if(this.smallerScreenSize){
        rows = 6;
      }

      for (let i = 0; i < rows; i++) {
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
          for (let j = 0; j < this.globColumnQnty; j++) {
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




        /////////////////////////////
     ////////////////////////
    // INSERT DAS IMAGENS //
   ////////////////////////
    ////////////////////////////

    public editCaptionNText(event){
        console.clear();
        console.log("-------------------INSERT---------------------")

         this.showModal(CaptionTextModalComponent);
        
        let parts = event.target.className.split(' ');

        let text;
        let action;
        let image; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        let teclas;

        if(parts[0].indexOf('#') !== -1){
          if(parts[0].substring(0,1) === "@") parts[0] = parts[0].split('$')[1];

          let x = <number>parts[0].split('#')[0];
          let y = <number>parts[0].split('#')[1];

          this.x = x;
          this.y = y;

          teclas = this.tecladoReplicant.teclas[y][x];
          text = this.tecladoReplicant.text[y][x];
          action = this.tecladoReplicant.action[y][x];
          image = this.tecladoReplicant.image[y][x]; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


        } else {


          let x = <number>parts[1].split('#')[0];
          let y = <number>parts[1].split('#')[1];

          
          this.x = x;
          this.y = y;
          

          teclas = this.tecladoReplicant.teclas[y][x];
          text = this.tecladoReplicant.text[y][x];
          action = this.tecladoReplicant.action[y][x];
          image = this.tecladoReplicant.image[y][x]; ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
            

          
        }

        

        let payload = new Array();

        payload.push(event);
        payload.push(text);
        payload.push(action);
        payload.push(image); ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
        payload.push(teclas); ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


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
              if(buttonImage === undefined) buttonImage = " ";  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////
 

              
              let parts = event.target.className.split(' ');

              let x = parts[0].split('#')[0];
              let y = parts[0].split('#')[1];
            


              let formula = this.globColumnQnty*Number(y)+Number(x);


              //console.log('x: ' + x);
              //console.log('y: ' + y);

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

               
            

              let validator = parts.length > 1 ? (parts[1].indexOf('#') !== -1 && imagem) : true;

                
                
                let validator2 = parts.length > 1 ? (parts[1].indexOf('#') !== -1 && imagem) : false;
                if( validator2 ) parts[0] = parts[1];

                if(parts[0].substring(0,1) === "@") parts[0] = parts[0].split('$')[1];

   

                
                //let formula = this.globColumnQnty*Number(y)+Number(x);
                

                let el, copied, copyToTarget = false;
                //if(event.target.value){
                if(event.target.value){
                  //console.log("MARK-IN-1");
                  el = $(event.target);
                  copyToTarget = true;
                  //console.log("WITH TARGET!");
                } else {
                  //console.log("MARK-IN-2");
                    let sEl = $("[id=copy]").clone();
                    
                    let el1 = document.getElementsByClassName('@copyArea$'+ x +'#'+ y +'');

                  
                    if(el1.length > 1) el1.item(1).remove();

                    
                    if(sEl[<number>formula] === undefined) {
                      //console.log("MARK-IN-3");
                      el = $(event.target);
                      copyToTarget = true;
                    } else {
                      //console.log("MARK-IN-4");
                      //el = sEl[<number>formula].cloneNode(true);
                      el = sEl[0].cloneNode(true);
                    }

                }


                //console.log(el);
                let normal = false;

                if($(el).find('input')[0]){
                 // console.log("MARK-IN-5");
                  //console.log("TEM INPUT");
                  normal = true;

                 // console.log("CAPTION: " + buttonCaption);
                  if(buttonCaption !== "*img") {
                   // console.log("MARK-IN-6");
                    //console.log("NÃO É IMAGEM");
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
                          console.log("SIZE CHANGER 1")
                          $($(el).find('input')[0]).css('height', this.imgMaxHeightSize);
                      }    
                  } else {
                   // console.log("MARK-IN-7");
                    //console.log("É IMAGEM");
                    $($(el).find('input')[0]).attr('value', '');
                  }    
                   

                  
                  if(( imgUrl || sysImg) && imagem  ){
                   // console.log("MARK-IN-8");
                          //console.log('(imUrl || sysImg && imagem)')
                      let found = false; 

                     // console.log("ANTES DE TUDO: " )
                     // console.log(JSON.stringify(this.imgLinesArray))
      
                      if(this.choppedNumber !== this.globColumnQnty){
      
                        for(let unit = 0; unit < this.imgLinesArray.length; unit++){
                          if(this.imgLinesArray[unit].toString() === y.toString()){
                            //console.log('Array value' + this.imgLinesArray[unit]);
                            //console.log('Y: ' + y);
                            found = true;
                            break;
                          }
                        }
      
                        let oldValueX = x;
                        //console.log("FOUND: " + found);
                        if(!found) {
                          //console.log("RECURSÃO ATIVADA NO INSERT")
                          x = this.mapToNewFormula(x,y, this.choppedNumber,false);
                          



                          let foundBlank = false;
                        while(this.tecladoReplicant.teclas[y][x] !== '' && x < this.choppedNumber){
                          x = x + 1;
                        }
                        if(x >= this.choppedNumber){
                          while(this.tecladoReplicant.teclas[y][x] !== '' && x > 0){
                            x = x - 1;
                          }

                          if(x <= 0){
                            return;
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

                        




                        //for( let uRow = 0; uRow < this.tecladoReplicant.teclas.length; uRow++){
                        if(!this.checkLineHasImage(y)){
                            this.keysRelocation(x,y);
                              //   for(let uCol = 0; uCol < this.tecladoReplicant.teclas[y].length; uCol++){
                            
                              //     let rearrangedFormula = this.globColumnQnty*Number(y)+Number(uCol);
                                
                              //     if($(sElContent[rearrangedFormula]).find('input')[0]){
                                
                              //       let copy = $(sElContent[rearrangedFormula]).find('input')[0].cloneNode(true);
                              //       $(sElContent[rearrangedFormula]).find('input')[0].remove();
                              //       let newUnit = this.mapToNewFormula(uCol, y, this.choppedNumber);
                              //       if(newUnit === x && newUnit !== 0){
                              //         console.log("IGUAL 1")
                              //         newUnit = newUnit - 1;
                              //       }
                              //       rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);
                              //       sElContent[rearrangedFormula].appendChild(copy);

                              //       this.tecladoReplicant.teclas[y][newUnit] = this.tecladoReplicant.teclas[y][uCol];
                              //       this.tecladoReplicant.teclas[y][uCol] = "";
                              //       this.tecladoReplicant.action[y][newUnit] = this.tecladoReplicant.action[y][uCol];
                              //       this.tecladoReplicant.action[y][uCol] = "";
                              //       this.tecladoReplicant.text[y][newUnit] = this.tecladoReplicant.text[y][uCol];
                              //       this.tecladoReplicant.text[y][uCol] = "";
                              //       this.tecladoReplicant.image[y][newUnit] = this.tecladoReplicant.image[y][uCol];
                              //       this.tecladoReplicant.image[y][uCol] = "";

                              //       console.log('x: ' + x + ' uCol: ' + uCol);
                                
                              //     } else if($(sElContent[rearrangedFormula]).find('button')[0]){
                              
                              //       let copy = $(sElContent[rearrangedFormula]).find('button')[0].cloneNode(true);
                              //       $(sElContent[rearrangedFormula]).find('button')[0].remove();
                              //       let newUnit = this.mapToNewFormula(uCol, y, this.choppedNumber);
                              //       if(newUnit === x && newUnit !== 0){
                              //         console.log("IGUAL 2")
                              //         newUnit = newUnit - 1;
                              //       }
                              //       rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);
                              //       sElContent[rearrangedFormula].appendChild(copy);

                              //       this.tecladoReplicant.teclas[y][newUnit] = this.tecladoReplicant.teclas[y][uCol];
                              //       this.tecladoReplicant.teclas[y][uCol] = "";
                              //       this.tecladoReplicant.action[y][newUnit] = this.tecladoReplicant.action[y][uCol];
                              //       this.tecladoReplicant.action[y][uCol] = "";
                              //       this.tecladoReplicant.text[y][newUnit] = this.tecladoReplicant.text[y][uCol];
                              //       this.tecladoReplicant.text[y][uCol] = "";
                              //       this.tecladoReplicant.image[y][newUnit] = this.tecladoReplicant.image[y][uCol];
                              //       this.tecladoReplicant.image[y][uCol] = "";
                              //       console.log('x: ' + x + ' uCol: ' + uCol);
        
                              //     } else if( this.tecladoReplicant.teclas[y][uCol].split('$')[0] === '*img' ){
                                    
                              //       let copy = sElContent[rearrangedFormula].cloneNode(true);
                              //       sElContent[rearrangedFormula].remove();
                              //       let newUnit = this.mapToNewFormula(uCol, y, this.choppedNumber);
                              //       if(newUnit === x && newUnit !== 0){
                              //         console.log("IGUAL 2")
                              //         newUnit = newUnit - 1;
                              //       }
                              //       rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);
                              //       sElContent[rearrangedFormula].appendChild(copy);

                              //       this.tecladoReplicant.teclas[y][newUnit] = this.tecladoReplicant.teclas[y][uCol];
                              //       this.tecladoReplicant.teclas[y][uCol] = "";
                              //       this.tecladoReplicant.action[y][newUnit] = this.tecladoReplicant.action[y][uCol];
                              //       this.tecladoReplicant.action[y][uCol] = "";
                              //       this.tecladoReplicant.text[y][newUnit] = this.tecladoReplicant.text[y][uCol];
                              //       this.tecladoReplicant.text[y][uCol] = "";
                              //       this.tecladoReplicant.image[y][newUnit] = this.tecladoReplicant.image[y][uCol];
                              //       this.tecladoReplicant.image[y][uCol] = "";
                              //       console.log('x: ' + x + ' uCol: ' + uCol);
                              //     }    
                              // }
                      }        
                      //}  

                      //console.log(JSON.stringify(this.oldPositions))

   
                        //formula = this.globColumnQnty*Number(y)+Number(x);
                 }  


                      this.imgLinesArray.push(Number(y));


                      
                      if(sysImg){

                        if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                        if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                        this.changeDragulaBackground( $($(el)), buttonImage, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);  
                      } else {
                        
                        if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                        if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                        this.changeDragulaBackground( $($(el)), "data:image/png;base64,"+ imgUrl, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);
                      }
                      
                      $($(el).find('input')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
                      $($(el).find('input')[0]).attr('display', 'none');
   
                } 


                } else if($(el).find('button')[0]){

                  //console.log("TEM BUTTON");
                  normal = true;

                  
                  if($($(el).find('button')[0]).find('mat-icon')[0]) $($(el).find('button')[0]).find('mat-icon')[0].remove();
                  
                  $($(el).find('button')[0]).text(buttonCaption);
                  if(buttonCaption !== "*img") {
                      $($(el).find('button')[0]).attr('value', buttonCaption);
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      if(this.imgLinesArray.includes(x)) $($(el).find('button')[0]).css('height', this.imgMaxHeightSize);
                  } else {
                    $($(el).find('button')[0]).attr('value', '');
                  }        
                  
                  if( (imgUrl || sysImg ) & imagem){
    
                          
                      let found = false; 

                      //console.log("ANTES DE TUDO: " )
                     // console.log(JSON.stringify(this.imgLinesArray))
      
                      if(this.choppedNumber !== this.globColumnQnty){
      
                        for(let unit = 0; unit < this.imgLinesArray.length; unit++){
                          if(this.imgLinesArray[unit].toString() === y.toString()){
                            //console.log('Array value' + this.imgLinesArray[unit]);
                            //console.log('Y: ' + y);
                            found = true;
                            break;
                          }
                        }
      
                        let oldValueX = x;
                        //console.log("FOUND: " + found);
                        if(!found) {
                          //console.log("RECURSÃO ATIVADA NO INSERT")
                          x = this.mapToNewFormula(x,y, this.choppedNumber, false);


                          let foundBlank = false;
                        while(this.tecladoReplicant.teclas[y][x] !== '' && x < this.choppedNumber){
                          x = x + 1;
                        }
                        if(x >= this.choppedNumber){
                          while(this.tecladoReplicant.teclas[y][x] !== '' && x > 0){
                            x = x - 1;
                          }

                          if(x <= 0){
                            return;
                          }
                        }



                          notX = true;
                        }

                    // //FAZ REMANEJAMENTO DE TECLAS
                    // let diff = Math.abs(x - oldValueX);
                    // let sElContent = $("[id=content]")
                    // for(let unit=0; unit < sElContent.length; unit++){
                    //     let formula = this.globColumnQnty*Number(y)+Number(unit);
                    //     let newEl = sElContent[formula].cloneNode(true);
                    //     sElContent[formula].remove();
                        
                    //     formula = this.globColumnQnty*Number(y)+Number(Math.abs(unit-diff) );
                    //     sElContent[formula].appendChild(newEl);
                    // }
                 }


                    this.imgLinesArray.push(Number(this.y) );
                    
  
                    if(sysImg){

           
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      this.changeDragulaBackground( $($(el)), buttonImage, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);  
                    } else {
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      this.changeDragulaBackground( $($(el)), "data:image/png;base64,"+ imgUrl, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);
                    }

                    $($(el).find('button')[0]).attr('class', 'tamanho-button-especial-big' + ' ' + y + '#' + x + '');
                    $($(el).find('button')[0]).attr('display', 'none');
          
                  } 

                }

                if(!imagem) buttonImage = "";


                if(!notX){
                    if(x.split("$")[0] === '@copyArea') x = x.split('$')[1];
                }    
             


                this.tecladoReplicant.action[y][x] = buttonAction;

                if(buttonCaption === '*img') {

                  this.tecladoReplicant.teclas[y][x] = buttonCaption + '$'+this.imgMaxHeightSize+'#'+this.imgMaxWidthSize ;
                } else {

                  this.tecladoReplicant.teclas[y][x] = buttonCaption;
                }  

                this.tecladoReplicant.text[y][x] = buttonText;

                this.tecladoReplicant.image[y][x] = buttonImage;  ////////////////////////////////ADICIONADO RECENTEMENTE ///////////////////////////////


               

                if(!normal){
                  //console.log("Não é normal!");
                  if($(el).find('mat-icon')[0]) $(el).find('mat-icon')[0].remove();
                  
                  $(el).text(buttonCaption);
                  if(buttonCaption !== "*img") {
                      $(el).attr('value', buttonCaption);
                  } else {
                    $(el).attr('value', '');
                  }        
                  

                  if( (imgUrl !== "" || sysImg ) & imagem){
     

                    this.imgLinesArray.push(Number(y) );
                    

                    if(sysImg){             
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      this.changeDragulaBackground( $($(el)), buttonImage, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);  
                    } else {
      
                      if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                      if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
                      this.changeDragulaBackground( $($(el)), "data:image/png;base64,"+ imgUrl, this.imgMaxHeightSize, this.imgMaxWidthSize, 100, 100);
                    }
                    
     
                  } 

                }

                $(el).removeAttr('tooltip');
                



                if(this.choppedNumber !== this.globColumnQnty){
                  
                  formula = this.globColumnQnty*Number(y)+Number(x);
                  

                  if(!copyToTarget) $("[id=content]")[formula].appendChild(el);  
                } else {
                  $("[id=content]")[formula].appendChild(el);  
                }
                
               // console.log('imgLinesArray:')
                //console.log(JSON.stringify(this.imgLinesArray))

                

                if( ( imgUrl || sysImg ) && imagem ){
                      let sElContent = $("[id=content]");
                      let sElLines = $("[id=blankLines]");
                      let sElRows = $("[id=blankRows]");
                      let sElNone = $("[id=blankNone]");

                      let randomColor =  this.getRandomColor();

                      for(let imgLine = 0; imgLine < this.imgLinesArray.length ; imgLine++ ){
                        for(let col=0; col < this.globColumnQnty ; col++){
                          if(col >= this.choppedNumber) continue;

                            let formula = this.globColumnQnty*Number(this.imgLinesArray[imgLine])+Number(col);
                            
                            
                            if(this.ENABLE_TEXT_MODE){
                              $($(sElContent)[formula]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                            } else {
                              $($(sElContent)[formula]).css('height', this.imgMaxHeightSize);
                            }
                            
                            $($(sElContent)[formula]).css('width', this.keysWidthSize);
                            

                            
                            
                            if(this.imgMaxHeightSize === 0 ) this.imgMaxHeightSize = this.keysHeightSize;
                            if(this.imgMaxWidthSize === 0 ) this.imgMaxWidthSize = this.keysWidthSize;
              
                          

                            if(this.ENABLE_TEXT_MODE){
                              $($(sElLines)[this.imgLinesArray[imgLine]]).css('height', this.imgMaxHeightSize + this.textModeFactor);
                              $($(sElRows)[this.imgLinesArray[imgLine]]).css('height', this.imgMaxHeightSize + this.textModeFactor);

                              $($(sElLines)[this.imgLinesArray[imgLine]]).css('margin-bottom', 4 + this.textModeMarginFactor);
                              $($(sElRows)[this.imgLinesArray[imgLine]]).css('margin-bottom', 4 + this.textModeMarginFactor);
                            } else {
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
                          if(this.ENABLE_TEXT_MODE){
                            $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize);  
                          } else {
                            $($($($(sElContentTmp)[formula]).find('div')[0]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);
                          }
                          
                        } 
                        if( $($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0] ){
                          if(this.ENABLE_TEXT_MODE){
                            $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.imgMaxHeightSize + this.textModeFactor);  
                          } else {
                            $($($($(sElContentTmp)[formula]).find('div')[1]).find('input')[0]).css('height', this.imgMaxHeightSize);
                          }
                          
                        }

                      }
                    }    


                    //CLEAR ALL ELEMENTS BIGGER THAN CHOPPEDNUMBER
                    for(let x = 0; x < this.tecladoReplicant.teclas.length; x++){
                      for(let y = 0 ; y  < this.tecladoReplicant.teclas[x].length; y++){
                        if(x > this.choppedNumber){
                          this.tecladoReplicant.teclas[x][y] = "";
                        }
                      }
                    }

                    // CHANGE SIZE OF NORMAL KEYS
                    let sElContent = $("[id=content]");
                    for(let x = 0; x < this.tecladoReplicant.teclas.length; x++){
                      for(let y=0; y< this.tecladoReplicant.teclas[x].length; y++){
                        let formula = this.globColumnQnty*Number(x)+Number(y);
                        
                       // console.log(JSON.stringify(this.imgLinesArray))
                        //console.log(JSON.stringify(x.toString()))
                        //console.log(this.imgLinesArray.includes(x) );
                        if( $($(sElContent)[formula]).find('input')[0] && this.imgLinesArray.includes(x) ){
                          $($($(sElContent)[formula]).find('input')[0]).css('height', this.imgMaxHeightSize);
                        } else if( $($(sElContent)[formula]).find('button')[0] && this.imgLinesArray.includes(x) ){
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
                            if(this.smallerScreenSize){
                              $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal-15);
                            } else {
                              $($(sElContent)[formula]).css('width', this.keysWidthSizeOriginal);
                            }
                              
                        }      
                      }
                    }

                    this.payloadSubscription.unsubscribe();
                    
                    console.log("imgLINES:")
                    console.log(JSON.stringify(this.imgLinesArray))


                    console.log(JSON.stringify(this.tecladoReplicant.teclas))
                    console.log(JSON.stringify(this.tecladoReplicant.action))
                    console.log(JSON.stringify(this.tecladoReplicant.text))
                    //console.log(JSON.stringify(this.tecladoReplicant.image))


        })
        


      }



      public keysRelocation(x: number, y: number){
          let DEBUG = false;

            console.log("--------------RELOCATION-ACTIVATED!!!--------")

            if(DEBUG) console.log("RELOCATION ACTIVATED!");
            if(DEBUG) console.log("CHOPPED NUMBER:")
            if(DEBUG) console.log(this.choppedNumber)
            let sElContent = $('[id=content]');


            let numberOfElements = 1;
            for(let unit = 0; unit < this.choppedNumber; unit++){
              console.log("loop1")
              if(this.tecladoReplicant.teclas[y][unit] !== ''){
                numberOfElements += 1;
              }
            }




            for(let uCol = 0; uCol < this.tecladoReplicant.teclas[y].length; uCol++){
                                
              let rearrangedFormula = this.globColumnQnty*Number(y)+Number(uCol);
            

              if( this.tecladoReplicant.teclas[y][uCol].split('$')[0] === '*img' ){
                
                if(DEBUG) console.log("-----------------------------")
                if(DEBUG) console.log("NO CASO IMAGEM:")

                let copy = sElContent[rearrangedFormula].cloneNode(true);
                sElContent[rearrangedFormula].remove();
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
                    console.log('nElements: ' + numberOfElements);
                    console.log("!foundBlank");
                    return;
                  } 
                }    
                

               
                rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);
                
                if(DEBUG) console.log("LOCUS: ");
                if(DEBUG) console.log(sElContent[rearrangedFormula]);
                
                //if( $(sElContent[rearrangedFormula]).find('input')[0] === undefined  || $(sElContent[rearrangedFormula]).find('button')[0] === undefined) 
                sElContent[rearrangedFormula].appendChild(copy);

                this.tecladoReplicant.teclas[y][newUnit] = this.tecladoReplicant.teclas[y][uCol];
                this.tecladoReplicant.teclas[y][uCol] = "";
                this.tecladoReplicant.action[y][newUnit] = this.tecladoReplicant.action[y][uCol];
                this.tecladoReplicant.action[y][uCol] = "";
                this.tecladoReplicant.text[y][newUnit] = this.tecladoReplicant.text[y][uCol];
                this.tecladoReplicant.text[y][uCol] = "";
                this.tecladoReplicant.image[y][newUnit] = this.tecladoReplicant.image[y][uCol];
                this.tecladoReplicant.image[y][uCol] = "";
                //console.log('x: ' + x + ' uCol: ' + uCol);


              } else if($(sElContent[rearrangedFormula]).find('input')[0]){
            
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
                    console.log('nElements: ' + numberOfElements);
                    console.log("!foundBlank");
                    return;
                  } 
                  
                } 


                if(DEBUG) console.log("FINAL NEWUNIT: " + newUnit);
                rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);

                if(DEBUG) console.log("LOCUS: ");
                if(DEBUG) console.log(sElContent[rearrangedFormula]);

                //if( $(sElContent[rearrangedFormula]).find('input')[0] === undefined  || $(sElContent[rearrangedFormula]).find('button')[0] === undefined) 
                sElContent[rearrangedFormula].appendChild(copy);

                this.tecladoReplicant.teclas[y][newUnit] = this.tecladoReplicant.teclas[y][uCol];
                this.tecladoReplicant.teclas[y][uCol] = "";
                this.tecladoReplicant.action[y][newUnit] = this.tecladoReplicant.action[y][uCol];
                this.tecladoReplicant.action[y][uCol] = "";
                this.tecladoReplicant.text[y][newUnit] = this.tecladoReplicant.text[y][uCol];
                this.tecladoReplicant.text[y][uCol] = "";
                this.tecladoReplicant.image[y][newUnit] = this.tecladoReplicant.image[y][uCol];
                this.tecladoReplicant.image[y][uCol] = "";

                //console.log('x: ' + x + ' uCol: ' + uCol);
            
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
                    console.log('nElements: ' + numberOfElements);
                    console.log("!foundBlank");
                    return;
                  } 
                
                } 
                

                rearrangedFormula = this.globColumnQnty*Number(y)+Number(newUnit);

                if(DEBUG) console.log("LOCUS: ");
                if(DEBUG) console.log(sElContent[rearrangedFormula]);

                //if( $(sElContent[rearrangedFormula]).find('input')[0] === undefined  || $(sElContent[rearrangedFormula]).find('button')[0] === undefined) 
                sElContent[rearrangedFormula].appendChild(copy);

                this.tecladoReplicant.teclas[y][newUnit] = this.tecladoReplicant.teclas[y][uCol];
                this.tecladoReplicant.teclas[y][uCol] = "";
                this.tecladoReplicant.action[y][newUnit] = this.tecladoReplicant.action[y][uCol];
                this.tecladoReplicant.action[y][uCol] = "";
                this.tecladoReplicant.text[y][newUnit] = this.tecladoReplicant.text[y][uCol];
                this.tecladoReplicant.text[y][uCol] = "";
                this.tecladoReplicant.image[y][newUnit] = this.tecladoReplicant.image[y][uCol];
                this.tecladoReplicant.image[y][uCol] = "";
                //console.log('x: ' + x + ' uCol: ' + uCol);

              }
          }
      }



      private mapToNewFormula(x: number, y: number, receptacle: number, inverse?: boolean):number{
            let DEBUG = false;                                                      
            //console.log("EXECUTADO FUNÇÃO RECURSIVA")
            // Arrays preparation phase
            //console.log('X ENVIADO: ' + x)
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
 
            //console.clear();
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
            //console.log("original EVEN");
            originalLowCenter = originalArray[Math.floor((originalArray.length-1)/2)];
            originalHighCenter = originalArray[Math.ceil((originalArray.length-1)/2)];

            if(joinOriginalArray[originalLowCenter] !== '' && joinOriginalArray[originalHighCenter] !== '') {console.log('MARK1'); return;}
            joinOriginalArray[originalLowCenter] = originalArray[originalLowCenter];
            joinOriginalArray[originalHighCenter] = originalArray[originalHighCenter];
          } else {
            // odd
            //console.log("original ODD");
            originalIsEven = false;
            
            if(originalArray.length > 1){
              originalUniqueCenter = originalArray[Math.floor((originalArray.length-1)/2)];
              //console.log("ORIGINAL CENTER: " + originalUniqueCenter)

              if(joinOriginalArray[originalUniqueCenter] !== '') {console.log('MARK2'); return;}
              
              

              for(let unit = 0; unit < copyOriginal.length; unit++){
                if(copyOriginal[unit] === originalUniqueCenter){
                  //leftOriginalArray = copyOriginal.slice(1, unit);
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
            //console.log("receptacle EVEN");
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
            //console.log("receptacle ODD");
            receptacleIsEven = false;
            // odd

            if(receptacleArray.length > 1){
                  receptacleUniqueCenter = receptacleArray[Math.floor((receptacleArray.length-1)/2)];
                if(originalIsEven){
                  if(joinReceptacleArray[originalLowCenter] !== '' && joinReceptacleArray[originalHighCenter] !== '') {console.log('MARK5'); return;}
                  //joinReceptacleArray[originalLowCenter] = receptacleArray[originalLowCenter];
                  joinReceptacleArray[originalLowCenter] = receptacleArray[receptacleUniqueCenter];
                  //joinReceptacleArray[originalHighCenter] = receptacleArray[originalHighCenter];
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
          
          
          // falta achar a base da recursão
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
          
          if( !foundOriginalEmpty && !foundReceptacleEmpty && leftOriginalArray.length <= 1 && leftReceptacleArray.length <= 1) return;
        
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

          if( !foundOriginalEmpty && !foundReceptacleEmpty && rightOriginalArray.length <= 1 && rightReceptacleArray.length <= 1) return;
          if(DEBUG) console.log("RECURSION RIGHT")
          this.mapToNewRecursive(x, y, rightOriginalArray, rightReceptacleArray, joinOriginalArray, joinReceptacleArray, false, true, DEBUG);
          if(DEBUG) console.log("BACK FROM RECURSION RIGHT")
     
      }


      public findElement(sElContent, x: number , y: number){
        //let result = new Array()
        for(let el = 0; el < sElContent.length; el++){
          // //x
          // result.push($(sElContent)[el].className.split(' ')[0].split('#')[0])
          // //y
          // result.push($(sElContent)[el].className.split(' ')[0].split('#')[1])

          // result.push($(sElContent)[el].className.split(' ')[0].split('#')[1])
          if($(sElContent)[el].className.split(' ')[0].split('#')[0].toString() === y.toString() &&
               $(sElContent)[el].className.split(' ')[0].split('#')[1].toString() === x.toString()){
                return el;
          }
        }
        
      }

      public calculateSum(actualLine: number){
        let removedNodes = 0;
        for(let line = 1; line < actualLine; line++){
          removedNodes = removedNodes + (this.globColumnQnty - this.teclado.teclas[line].length);
        }
        return removedNodes;
      }



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

                    //  if(this.markOfRemove){
                    //     if(targetY > 0) formula = formula - Math.abs( (this.globColumnQnty*this.teclado.teclas.length) - $('[id=content]').length )
                    //  }
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
                  //console.log(this.choppedNumber)

                  if( Number($($(sElContent)[formula])[0].className.split(' ')[0].split('#')[0]) >= this.choppedNumber 
                    && this.imgLinesArray.includes(line)){
                    $($($(sElContent)[formula])[0]).css('visibility', 'hidden');
                    
                  }
                }
              }
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
        //  height = height * this.scale;
        //  width = width * this.scale;

        el.css("background", "url("+ url +") no-repeat");
  
        let params = <string>(percentX + '% ' + percentY + '%');
        el.css("background-size", params);
        //let percent = (((this.keysWidthSize-width*this.scale)/2)/this.keysWidthSize)*100;
        let percent = (((this.keysWidthSize-width)/2)/this.keysWidthSize)*100;

        el.css('background-position' , 'center center');

        el.css("transform", 'translateX('+ percent +'%)');
        
        // el.css("height", height*this.scale);
        // el.css("width", width*this.scale);

        el.css("height", height);
        el.css("width", width);

        // el.css('filter', 'alpha(Opacity=30)')
        // el.css('opacity', '0.3');
      }

      public checkExistence(iR: number){
        this.exist = this.imgLinesArray.includes(iR.toString());
 
      }

      public checkLineHasImage(Y: number) {
    
          
        for(let z = 0; z < this.tecladoReplicant.teclas[Y].length; z++){

             if(this.tecladoReplicant.teclas[Y][z].split('$')[0] === '*img'){//} && z!== X) {

    
              return true;
            } 
          
          }

    
        
          return false;
    }

      
}
