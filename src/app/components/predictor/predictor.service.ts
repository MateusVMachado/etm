import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';
import { AppServiceBase } from '../shared/services/app-service-base.service';

@Injectable()
export class PredictorService extends AppServiceBase{

  public currentWord: string = '';
  public wordsSubject = new ReplaySubject<Array<string>>();
  public words$ = this.wordsSubject.asObservable();


  constructor(
    protected injector: Injector,
    public http: HttpClient,
  ) {
    super(injector);
  }

  public addCharacterAndPredict(newChar: string) {
    this.currentWord = this.currentWord + newChar;
    this.predict(this.currentWord);
  }

  public wordPicked(word: string) {
    this.submitWord(word);
    this.clear();
    this.getInitialWords();
  }

  public clear() {
    this.currentWord = '';
    this.wordsSubject.next(['','','','','']);
  }

  public predict(text: string) {

    if (text !== '') {
      this.http.post(
        this.backendAddress + '/predict',
        {
          text: text,
        },
      ).subscribe(data => {

        let response = [];
        for (let i = 0; i < 5; i++) {
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
        this.backendAddress + '/addOrUpdateWord',
        {
          text: word,
        },
      ).subscribe(()=>{})
    }

  }

  public removeWord(word: string) {

    if(word !== '') {
      this.http.post(
        this.backendAddress + '/removeOrUpdateWord',
        {
          text: word,
        },
      ).subscribe(()=>{})
    }

  }

  public getInitialWords() {

    this.http.post(
      this.backendAddress + '/getInitialWords',
      {}
    ).subscribe(data => {

      let response = [];
      for (let i = 0; i < 5; i++) {
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
