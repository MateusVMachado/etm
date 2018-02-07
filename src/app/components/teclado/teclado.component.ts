import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-teclado',
  templateUrl: './teclado.component.html',
  styleUrls: ['./teclado.component.css']
})
export class TecladoComponent implements OnInit {

  @Output() key: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  public getValue(keyValue: any): void {
    this.key.emit(keyValue);
  }

}
