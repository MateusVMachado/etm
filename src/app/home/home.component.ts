import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../app.component.css']
})
export class HomeComponent implements OnInit  {


  public options: Object = {
    placeholderText: 'Insira seu texto aqui',
    heightMin: 100,
    heightMax: 1000//this.height
  };

  public texto: string; 

  constructor() { }

  ngOnInit() {
    this.texto = '';
  }

  public getValue(keyValue: any) {
    if(keyValue === ' '){
      keyValue = '&nbsp;';
    } else if ( keyValue === '\n'){
      keyValue = '<br>';
    } else if ( keyValue === '\t'){
      keyValue = '&nbsp;&nbsp;&nbsp;&nbsp;';
    }
    this.texto += keyValue; // texto que vai no editor
    console.log(keyValue);
    console.log(this.texto);
    //console.log(this.input.nativeElement);

  }

}

