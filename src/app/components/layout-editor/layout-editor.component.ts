import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TecladoComponent } from '../teclado/teclado.component';
import { TecladoModel } from '../teclado/teclado.model';
import { TecladoService } from '../teclado/teclado.service';
import { DragulaService } from 'ng2-dragula';
import { OpenFACLayout, LayoutLine, LayoutButton } from './layout.model';


@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.css']
})


export class LayoutEditorComponent implements OnInit, OnDestroy {
    
    public masterKeys: TecladoModel = new TecladoModel(); 
    public teclado: TecladoModel = new TecladoModel();
    private correctChoices: any;
    public matrixIndex: string;
    public spillMode: boolean = false;

    constructor(private router: Router, private tecladoService: TecladoService, private dragulaService: DragulaService) {

      dragulaService.setOptions('master-bag', {
        accepts: function (el, target, source, sibling) {
          return target.id === 'content';
        },
        copy: function (el, source) {
          return source.id === 'copy';
        },
        removeOnSpill: function (el, source) {
          return source.id === 'content';
        },  
      });

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

    public setCopyMode(){
      //this.spillMode = false;
    }

    public setSpillMode(){
      //this.spillMode = true;
    }

    private onDrag(value) {
      if(value[2].id === 'copy') this.setCopyMode();
      if(value[2].id === 'content') this.setSpillMode();
    }    

    private onDrop(value) {
      if (value[2] == null) //dragged outside any of the bags
          return;
    
          console.log(value[2].title);
          console.log(value[1].value );

          let parts = value[2].title.split("#");
          console.log(parts);
          console.log(parts);
          let x = <number>parts[0];
          let y = <number>parts[1];

          console.log("x: " + x + "y: " + y);
          console.log(value[1].value );
          
          //this.teclado.teclas[x] = []; 
          //this.teclado.teclas[x][y] = [];
          //this.teclado.teclas[x][y] = "teste";//value[1].value;


          //console.log("Valor na tecla: " + this.teclado.teclas[x][y]);

          console.log(JSON.stringify(this.teclado));

    }    

    public sayHello(mystring: string){
      console.log("HELLOOOO from " + mystring);
    }

    public populateLayout(type: string): OpenFACLayout{
      let openFacLayout = new OpenFACLayout(); 
      openFacLayout.nameLayout = type;
      openFacLayout.email = 'email.teste@email.com'; 

      //let teclado = this.loadKeyboard(type);
      let teclado; // FAZER ATRIBUIÇÃO DO TECLADO QUE ESTÀ SENDO GERADO
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



    private createEmptyKeyboard(){
     
      for (let i = 0; i < 5; i++) {
        this.teclado.teclas[i] = [[]];
         let line = new Array();
         line = [];
          for (let j = 0; j < 14; j++) {
              line[j] = "X";
          }
          //this.teclado.teclas.push(line);  
          this.teclado.teclas[i] = line;  
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
