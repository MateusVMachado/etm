import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TeclaModel } from './tecla.model';
import { TeclaService } from './tecla.service';
import { Observable } from 'rxjs/Observable';

import { Http } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Component({
  selector: 'app-tecla',
  templateUrl: './tecla.component.html',
  styleUrls: ['./tecla.component.css']
})

export class TeclaComponent implements OnInit {

  public teclado: TeclaModel = new TeclaModel();

  public tecla: string;
  public texto: string;
  public testeTexto: string = '';

  public data = [];

  restaurant: string;

  @Input() public layoutHide: boolean;

  @Input() public lastValue: string;
  @Output() onKeyPicked: EventEmitter<string> = new EventEmitter<string>();


  constructor(private teclaService: TeclaService) {
   }

  ngOnInit() {
    this.texto = '';
    this.teclado.teclas = [];

      this.teclaService.loadData().subscribe((data) => {
         this.teclado = <TeclaModel>(data);
         console.log(this.teclado.teclas);
      }
    );

    this.teclaService.loadTeclado("normal");
  }

  public capsLock() {
  /*  if (!(this.teclado.type === 'caps')) {
      this.teclaService.loadTeclado('caps');
      console.log(this.teclado.type);
    }else {
      this.teclaService.loadTeclado('normal');
      console.log(this.teclado.type);
    }*/
  }

  public getValue(event) {
    console.log(event);
    console.log(event.srcElement);
    if (event.srcElement) {
      this.onKeyPicked.emit(event.srcElement.value); // é o próprio valor
    }else{
      this.onKeyPicked.emit(event);
    }
  }

}

