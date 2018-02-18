//import { EditorModule } from '@tinymce/tinymce-angular';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as ckeditor from 'ckeditor';

@Component({
  selector: 'app-teclado',
  templateUrl: './teclado.component.html',
  styleUrls: ['./teclado.component.css']
})
export class TecladoComponent implements OnInit {

  @Output() key: EventEmitter<string> = new EventEmitter<string>();
  public texto: string;

  constructor() { }

  ngOnInit() {
    this.texto = '';
  }

  public getValue(keyValue: any): void {
    this.texto = this.texto + keyValue;
  }

}
