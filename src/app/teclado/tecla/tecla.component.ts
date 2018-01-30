import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tecla',
  templateUrl: './tecla.component.html',
  styleUrls: ['./tecla.component.css']
})
export class TeclaComponent implements OnInit {
  private isCapsActivated: boolean;
  public tecla: string;
  public texto: string;
  @Output() onKeyPicked: EventEmitter<string> = new EventEmitter<string>();

  public row: string[] = ['\'','1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
  public pRow: string[] = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
  public sRow: string[] = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '\''];
  public tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];
  
  constructor() { }

  ngOnInit() {
    this.isCapsActivated = false;
    this.texto = '';
  }

  public capsLock(){
    if(!this.isCapsActivated){
      this.row = ['~','!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'];
      this.pRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
      this.sRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç',  ':', '\"'];
      this.tRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?'];
      this.isCapsActivated = true;
      console.log(this.isCapsActivated);
    }else{
      this.row = ['\'','1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
      this.pRow = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
      this.sRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '\''];
      this.tRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];
      this.isCapsActivated = false;
    }
  }

  public getValue(event){
    console.log(event);
    if(event.srcElement){
      this.onKeyPicked.emit(event.srcElement.value);
    }else{
      this.onKeyPicked.emit(event);
    }
  }

}
