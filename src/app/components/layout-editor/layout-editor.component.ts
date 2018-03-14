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

      var counter = 0;

      var drake = dragula({});

      /*
      $('#add_section').on('click', function() {       
        var elem = '<div class="main row"><div class="tamanho-button-especial"> <div></div>' + (counter++) + '</div></div>';       
        $('#container').append(elem);
        drake.containers.push($('.main').last().get(0));
      })*/
      let totalLength = 0;
      //for(let i = 0 ; i < this.teclado.teclas.length; i++){
      //  for(let j=0; j < this.teclado.teclas.length[i].length; j++){
      //      totalLength += 1;
      //  }
     // }

      this.tecladoReplicant.teclas.forEach(element => {
        element.forEach(element => {
            totalLength += 1;
        });
      });

      $('#loadKeyboard').on('change', function() {       
         /*
          var elem = '<div style="background-color: rgb(94, 175, 221);'+
          'color:black;'+
          'height:100%;'+
          'width: 100%;'+
          'position: relative;'+
          'top: 0;'+
          'margin-right: 6px;'+
          'border-radius:  8px;'+
          'display: inline-block;'+
          'text-align: center;'+
          'white-space: nowrap;'+
          'vertical-align: middle;'+
          'user-select: none;'+
          'border: 1 solid white;'+
          'font-family: Exo;"><div>'+ (counter++) +'</div></div>';       
          */
          
          
          var elem2;
          elem2 = $("[id=copy]")[1].cloneNode(true);
          

          let iCount = 0;
          let jCount = 0;
          $("[id=content]").each(function(index){
            //console.log($(this).index())
            //$(this).append(elem2);
            //$(this).last().append(elem2);
          })

          
          let sEl = $("[id=copy]").clone();

          console.log(totalLength);
          for(let i = 0; i< totalLength; i++){
            if(!sEl[i]) break;
            //sEl[i] é o elemento a ser copiado e $("[id=content]")[i] é o receptor 
 
            //let el = $("[id=copy]")[1].cloneNode(true);
            //let sEl = $("[id=copy]").clone();
            //sEl[i].id = "newContent";
            //sEl[1].setAttribute('style', 'background-color: rgb(94, 175, 221)');
            //console.log(sEl[1].attributes);
            sEl[i].removeAttribute('tooltip');
            
            //sEl[1].setAttribute('tooltip', '');
            //$("#example").attr('title', obj.text);
            let el = sEl[i].cloneNode(true);
            //if($(el).find('input')[0].className) $(el).find('input')[0].className = 'tamanho-button-especial-full';
            if(!$(el).find('input')[0]){
              //console.log($(value[1]).find('button')[0].className);
              $(el).find('button')[0].className = 'tamanho-button-especial-full'
            }  else {
              $(el).find('input')[0].className = 'tamanho-button-especial-full'
           }


            //console.log($(el).find('input')[0].className = 'tamanho-button-especial-full');
            //console.log(el);
            
            $("[id=content]")[i].appendChild(el);
            
            //$("[id=content]")[i].setAttribute('style', 'background-color: blue');
          }
 

      })

      //drake.containers.push($('.main').get(0));
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
          
          let newTitle = value[2].className.split('@');
          
          let title = newTitle[1];


          let parts = title.split("#");

          let x = <number>parts[0];
          let y = <number>parts[1];

          //console.log(value[2]);
          //console.log($(value[1]).find('input').val() );
          console.log($(value[1]).find('button')[0]);

          if($(value[1]).find('input')[0] !== undefined){
            console.log("MARK1");
            //console.log($(value[1]).find('button')[0].className);
            $(value[1]).find('button')[0].className = 'tamanho-button-especial-full'
            console.log("MARK2");
          }  else if ($(value[1]).find('input')[0] !== undefined) {
            console.log("MARK3");
            $(value[1]).find('input')[0].className = 'tamanho-button-especial-full'
            console.log("MARK4");
         } else {
          console.log("MARK5");
          value[1].className = "tamanho-button-especial-full";
          console.log("MARK6");
         }
          //console.log($(value[1]).find('input')[0].className = 'tamanho-button-especial-full');
          
          console.log(value[1]); 
          //value[1].className = "tamanho-button-especial-full";

          console.log("MARK7");
          if(this.tecladoReplicant.teclas[y][x] === "") this.tecladoReplicant.teclas[y][x] = value[1].value ;
          console.log("MARK8");
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
