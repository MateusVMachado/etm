import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../app.component.css']
})
export class HomeComponent implements OnInit  {
  
  public texto: string = '';

  constructor(){ }

  ngOnInit() {}

  public getValue(keyValue: any){
    this.texto += keyValue; 
    console.log(this.texto)
  }

}
