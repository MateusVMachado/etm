import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TecladoComponent } from '../teclado/teclado.component';
import { TecladoModel } from '../teclado/teclado.model';
import { TecladoService } from '../teclado/teclado.service';


@Component({
  selector: 'app-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.css']
})

export class LayoutEditorComponent implements OnInit, OnDestroy {
    
    public masterKeys: TecladoModel = new TecladoModel(); 
    public teclado: TecladoModel = new TecladoModel();

    constructor(private router: Router, private tecladoService: TecladoService) {
      //this.tecladoService.loadData().subscribe((data)=>{
      //   console.log(data);
         //this.tecladoService.convertLayoutToKeyboard(this.teclado, data[0]);
      //   this.createEmptyKeyboard();
      //});
      this.createEmptyKeyboard();
      
    }


    createEmptyKeyboard(){
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

    ngOnDestroy() {
      //Called once, before the instance is destroyed.
      //Add 'implements OnDestroy' to the class.
      
    }

    ngOnInit() {
      //this.tecladoService.subscribeToTecladoSubject().subscribe((result) => {
      //  this.teclado = result;
      //});
      
    }
}
