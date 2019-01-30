import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class PredictorService {

  public currentWord: string = '';
  public wordsSubject = new ReplaySubject<Array<string>>();
  public words$ = this.wordsSubject.asObservable();


  constructor(
    public http: HttpClient,
  ) { }

  public addCharacterAndPredict(newChar: string) {
    this.currentWord = this.currentWord + newChar;
    this.predict(this.currentWord);
  }

  public wordPicked(word: string) {
    this.submitWord(word);
    this.clear();
  }

  public clear() {
    this.currentWord = ''; 
    this.wordsSubject.next(['','','']);
  }

  public predict(text: string) {

    if (text !== '') {
      this.http.post(
        'http://localhost:8080/predict',
        {
          text: text,
        },
      ).subscribe(data => {

        let response = [];
        for (let i = 0; i < 3; i++) {
          if (data[i]) {
            response.push(data[i].word)
          } else {
            response.push('');
          }
        }

        this.wordsSubject.next(response);

      })
    }
  
  }

  public submitWord(word: string) {

    if(word !== '') {
      this.http.post(
        'http://localhost:8080/addOrUpdateWord',
        {
          text: word,
        },
      ).subscribe(()=>{})
    }

  }

  public removeWord(word: string) {

    if(word !== '') {
      this.http.post(
        'http://localhost:8080/removeOrUpdateWord',
        {
          text: word,
        },
      ).subscribe(()=>{})
    }

  }

  public getInitialWords() {

    this.http.post(
      'http://localhost:8080/getInitialWords',
      {}
    ).subscribe(data => {

      let response = [];
      for (let i = 0; i < 3; i++) {
        if (data[i]) {
          response.push(data[i].word)
        } else {
          response.push('');
        }
      }

      this.wordsSubject.next(response);

    })

  }

}