import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { TeclaModel } from './tecla.model';
import { TeclaService } from './tecla.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { KeyboardData } from '../../../storage';

import { OpenFacComponent } from '../../openFac/openFac.component';
import { ActiveLineCol } from '../../openFac/activeLine.model';

@Component({
  selector: 'app-tecla',
  templateUrl: './tecla.component.html',
  styleUrls: ['./tecla.component.css']
})

export class TeclaComponent implements OnInit {

  public openFac: OpenFacComponent;
  public activeLine: ActiveLineCol = new ActiveLineCol();

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
    
    this.teclaService.loadData().catch((error) => {
      this.teclado = this.teclaService.loadTeclado("normal");
      throw new Error("teclado local");
    }).subscribe((data) => {
      if ( data ) {
        this.teclado = <TeclaModel>(data[0]);
        this.openFac = new OpenFacComponent(this.activeLine, this.teclado);
        KeyboardData.data = <TeclaModel>(data);
      }
    });
    
  }

  public capsLock() {
    if (this.teclado.type === 'normal') {
      this.teclado = <TeclaModel>(KeyboardData.data[1]);
    }else {
      this.teclado = <TeclaModel>(KeyboardData.data[0]);
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

