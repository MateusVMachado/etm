import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TeclaModel } from './tecla.model';
import { TeclaService } from './tecla.service';
import { Observable } from 'rxjs/Observable';

import { Http } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { KeyboardData } from '../../../storage';

import { OpenFacComponent } from '../../openFac/openFac.component';

@Component({
  selector: 'app-tecla',
  templateUrl: './tecla.component.html',
  styleUrls: ['./tecla.component.css']
})

export class TeclaComponent implements OnInit {

  public openFac: OpenFacComponent;

  @ViewChild('tecladoControl') tecladoControl: ElementRef; // input DOM element
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

     //this.teclado = this.teclaService.loadTeclado("normal");
     //this.tecladoControl.nativeElement.click();

     //this.openFac = new OpenFacComponent();
    
    this.teclaService.loadData().catch((error) => {
      //this.teclado = this.teclaService.loadTeclado("normal");
      //this.tecladoControl.nativeElement.click();
      this.tecladoControl.nativeElement.click();
      throw new Error("teclado local");
    }).subscribe((data) => {
      if ( data ) {
        this.teclado = <TeclaModel>(data[0]);
        // this.teclado = <TeclaModel>(data[4]); //CUSTOM
        KeyboardData.data = <TeclaModel>(data);
        console.log(this.teclado.teclas);
      }
      this.tecladoControl.nativeElement.click();
    });


    // CRIA TODO O PROCESSO DO OpenFac
    this.openFac = new OpenFacComponent();
    
  }

  public capsLock() {
    if (this.teclado.type === 'normal') {
      this.teclado = <TeclaModel>(KeyboardData.data[1]);
      console.log(this.teclado.type);
    }else {
      // this.teclado = this.teclaService.loadTeclado('normal');
      this.teclado = <TeclaModel>(KeyboardData.data[0]);
      console.log(this.teclado.type);
    }
  }

  public getValue(event) {
    if (event.srcElement) {
      this.onKeyPicked.emit(event.srcElement.value); // é o próprio valor
    }else {
      this.onKeyPicked.emit(event);
    }
  }

}

