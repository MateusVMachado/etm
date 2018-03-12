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

@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.css']
})


export class LayoutEditorComponent extends AppBaseComponent implements OnInit, OnDestroy {
    
    public masterKeys: TecladoModel = new TecladoModel(); 
    public teclado: TecladoModel = new TecladoModel();
    public tecladoReplicant: TecladoModel = new TecladoModel();
    private correctChoices: any;
    public matrixIndex: string;
    public spillMode: boolean = false;
    public timerId: any;

    public aux: string;
    private email: string;

    constructor(private router: Router, 
                private tecladoService: TecladoService, 
                private dragulaService: DragulaService,
                private authService: AuthService,
                private injector: Injector,
                private http: HttpClient,
                private layoutEditorService: LayoutEditorService) {
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
        //console.log(value);
        this.onDrag(value);
    });

      dragulaService.drop.subscribe((value) => {
          //console.log(value);
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
      console.log("FROM COPY AREA");
      console.log(value[2].var);
      //this.spillMode = false;
    }

    public setKeyboardState(value){
      console.log("FROM KEYBOARD AREA");

      let newTitle = value[2].className.split('@');
      let title = newTitle[1];
      //console.log("OLD VALUE: " + value[2].title.toString());
      console.log("OLD VALUE: " + title.toString());
      //let parts = value[2].title.split("#");
      let parts = title.split("#");
      let x = <number>parts[0];
      let y = <number>parts[1];
      this.tecladoReplicant.teclas[y][x] = "";
      console.log(JSON.stringify(this.tecladoReplicant));
      //this.spillMode = true;
    }


    public onMouseOverMaster(){

    }

    public onMouseLeaveMaster(){

    }

    private onOver(value) {
      console.log("MARK1");
      this.setTimeToDisappear(value);
    } 

    private onDrag(value) {
      let valueParts = value[2].id.split('$');
      let theValue = valueParts[0];
      if(theValue === 'copy') this.setCopyMode(value);
      if(theValue === 'content') this.setKeyboardState(value);

      //if(value[2].id === 'copy') this.setCopyMode(value);
      //if(value[2].id === 'content') this.setKeyboardState(value);
    }    

    private onDrop(value) {
      if (value[2] == null) {//dragged outside any of the bags
          //let bigParts = value[1].title.split("$");
          //let parts = bigParts[1].split('#');
          //let x = <number>parts[0];
          //let y = <number>parts[1];
          //this.tecladoReplicant.teclas[y][x] = "";
          //console.log(JSON.stringify(this.tecladoReplicant));
          return;
      }    
          let newTitle = value[2].className.split('@');
          let title = newTitle[1];

          //console.log(value[2].title);
          console.log(title);
          //console.log("NEW VALUE: " + value[2].title.toString());
          console.log("NEW VALUE: " + title.toString());
          //console.log(value[2].title);
          console.log(title);
          console.log(value[1].value );

          //let parts = value[2].title.split("#");
          let parts = title.split("#");
          console.log(parts);
          console.log(parts);
          let x = <number>parts[0];
          let y = <number>parts[1];

          console.log("x: " + x + "y: " + y);
          console.log(value[1].value );
          

         // value[2].className = "full";
         
          value[1].className = "tamanho-button-especial-full";
          console.log("CLASS NAME: " + value[1].className);

          if(this.tecladoReplicant.teclas[y][x] === "") this.tecladoReplicant.teclas[y][x] = value[1].value ;

          console.log(JSON.stringify(this.tecladoReplicant));

    }    

    public sayHello(mystring: string){
      console.log("HELLOOOO from " + mystring);
    }

    public populateLayout(replicant: TecladoModel, email: string): OpenFACLayout{
      let openFacLayout = new OpenFACLayout(); 
      openFacLayout.nameLayout = replicant.type;
      openFacLayout.email = email; 

      //let teclado = this.loadKeyboard(type);
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


   public saveKeyboardLayout(){
      // LOAD LAYOUT CONFIGURATION OBJECT
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
        
        if(tam > 0) finalKeyboard.teclas.push(line);  
      });

      console.log("FINALKEYBOARD");
      console.log(JSON.stringify(finalKeyboard) );
      console.log("FINALKEYBOARD");

      let user = this.authService.getLocalUser();
      //let layout = this.populateLayout(this.tecladoReplicant, user.email);
      let layout = this.populateLayout(finalKeyboard, user.email);
      this.messageService.success("Layout Salvo! Todas as linhas e colunas em branco foram suprimidas.");

      this.layoutEditorService.saveNewKeyboard(layout).subscribe((result)=>{
        console.log("Teclado Inserido");
      });
      
      // SALVA layout NO BANCO
      console.log(JSON.stringify(layout) );

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
          //this.teclado.teclas.push(line);  
          this.teclado.teclas[i] = line;
          this.tecladoReplicant.teclas[i] = lineReplicant;  
      }  
      
      for (let i = 0; i < 30; i++) {
        let line = new Array();
        for (let j = 0; j < 14; j++) {
            line.push('tecla'+ i.toString() + j.toString());
        }
        this.masterKeys.teclas.push(line);  
    }   
      //this.teclado.teclas.push()
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
