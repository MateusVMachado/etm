import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../app.component.css']
})
export class HomeComponent implements OnInit  {
  
  public texto: string = '';
  public options: Object = {
    placeholderText: 'Digite aqui',
    height: 279,
    toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', '|', 'fontFamily',
        'fontSize', 'color', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 
        'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'embedly', 
        'insertFile', 'insertTable', '|', 'emoticons', 'specialCharacters', 'selectAll', 
        'clearFormatting', '|', 'print', 'spellChecker', 'help', 'html', '|', 'undo', 'redo']
  };

  constructor(){ }

  ngOnInit() {}

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
  }

}
