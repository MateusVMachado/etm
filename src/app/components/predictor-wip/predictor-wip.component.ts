import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'predictor-wip',
  templateUrl: './predictor-wip.component.html',
  styleUrls: ['./predictor-wip.component.scss']
})
export class PredictorWipComponent implements OnInit {

  public words: Array<any>;
  public currentText: string;

  constructor(public http: HttpClient) { }

  ngOnInit() {
  }

  public onTextChange(text: string) {

    if (text !== '') {
      this.http.post(
        'http://localhost:8080/predict',
        {
          text: text,
        },
      ).subscribe(data => {
        this.displayWords(data);
      })
    } else {
      this.clearAll();
    }
    
  }

  public submitCurrentText() {

    if(this.currentText !== '') {
      this.http.post(
        'http://localhost:8080/addOrUpdateWord',
        {
          text: this.currentText,
        },
      ).subscribe(()=>{})
    }

    this.clearAll();

  }

  public removeWord() {

    if(this.currentText !== '') {
      this.http.post(
        'http://localhost:8080/removeOrUpdateWord',
        {
          text: this.currentText,
        },
      ).subscribe(()=>{})
    }

    this.clearAll();

  }

  
  public pickWord(word) {
    this.currentText = word.word;
    this.onTextChange(word.word);
  }
  
  displayWords(data: any) {
    this.words = data
  }

  check() {
    console.log(this.currentText)
  }

  clearAll() {
    this.currentText = undefined;
    this.words = [];
  }

}
