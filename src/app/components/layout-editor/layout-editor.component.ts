import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TecladoComponent } from '../teclado/teclado.component';
import { TecladoModel } from '../teclado/teclado.model';
import { TecladoService } from '../teclado/teclado.service';
import { DragulaService } from 'ng2-dragula/components/dragula.provider';


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

    constructor(private router: Router, private tecladoService: TecladoService, private dragulaService: DragulaService) {
        dragulaService.setOptions('fifth-bag', {
          copy: true,
          copySortSource: true
      });
      dragulaService.drop.subscribe((value) => {
          console.log(value);
          this.onDrop(value);
      });
      this.createEmptyKeyboard();
      
    }


    ngOnDestroy() {
      //Called once, before the instance is destroyed.
      //Add 'implements OnDestroy' to the class.
      this.dragulaService.destroy('fifth-bag'); 
    }

    ngOnInit() {
      //this.tecladoService.subscribeToTecladoSubject().subscribe((result) => {
      //  this.teclado = result;
      //});
      
    }

    private onDrop(value) {
      if (value[2] == null) //dragged outside any of the bags
          return;
      if (value[2].id !== "content" && value[2].id !== value[3].id) { //dragged to a container that should not add the element
          console.log(value[2].title );
          value[1].remove();
    
        } else {
          console.log(value[2].title);
          //value[1].remove();
        }
    }    


    private createEmptyKeyboard(){
      //let line = new Array();
      for (let i = 0; i < 5; i++) {
          let line = new Array();
          for (let j = 0; j < 14; j++) {
              line.push('');
          }
          this.teclado.teclas.push(line);  
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
