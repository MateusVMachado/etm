import { Injectable } from '@angular/core';

@Injectable()
export class PredictorWipService {

  constructor() { }

  predict(metaWord: string) {
    //check cache first
    this.displayWords(this.getWords(metaWord));
  }

  getWords(metaWord: string): Word[] {
    //search backend for words
    //
    // SELECT TOP 3 
    // FROM Words
    // WHERE word LIKE %metaWord%
    // ORDER BY probability
    //
    //or something like that
    return [
      new Word("brother"),
      new Word("brush"),
      new Word("brie")
    ]
  }

  displayWords(words: Word[]) {
    //display the words
  }

  ///////////////////////

  wordPicked(word: Word) {
    this.inputWord(word)
    word.probability = word.probability + 1
    this.saveWord(word);
  }

  inputWord(word: Word) {
    //code that inputs word into the editor
  }

  removeWord(word: Word) {
    //code that removes word from the editor
  }

  saveWord(word: Word) {
    //code that saves word to backend
    //
    //can also be used to let user add their own words
    //or "learn" from user input automatically
  }

  wordUnpicked(word: Word) {
    this.removeWord(word);
    word.probability = word.probability - 1;
    this.saveWord(word);
  }

}

class Word {

  constructor(word: string, probability?: number){
    this.word = word;
    if (probability) {
      this.probability = probability;
    } else {
      this.probability = 0;
    }
  }

  word: string;
  probability: number;

}