import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TeclaModel } from './tecla.model';
import { TeclaService } from './tecla.service';
import { LastValueDirective } from './tecla.directive';

@Component({
  selector: 'app-tecla',
  templateUrl: './tecla.component.html',
  styleUrls: ['./tecla.component.css']
})

export class TeclaComponent implements OnInit {

  public teclado: TeclaModel = new TeclaModel();

  public tecla: string;
  public texto: string;

  @Input() public layoutHide: boolean;

  @Input() public lastValue: string;
  @Output() onKeyPicked: EventEmitter<string> = new EventEmitter<string>();


  constructor(private teclaService: TeclaService) {
   }

  ngOnInit() {
    this.texto = '';
    this.teclado = this.teclaService.loadTeclado('normal');

    this.layoutHide = false;

  }

  public capsLock() {
    if (!(this.teclado.type === 'caps')) {
      this.teclaService.loadTeclado('caps');
      console.log(this.teclado.type);
    }else {
      this.teclaService.loadTeclado('normal');
      console.log(this.teclado.type);
    }
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

  public teste() {

    this.teclado = this.teclaService.loadTeclado('caps');

    if ( this.teclado !== undefined ) {
      console.log(this.teclado.teclas);
    } else {
      console.log('teclado vazio!');
    }
  }


  setHide() {
    if (this.layoutHide) {
      this.layoutHide = false;
      console.log(false);
    } else {
      this.layoutHide = true;
       console.log(true);
    }
  }


}

