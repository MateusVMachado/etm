import { NextFunction, Request, Response } from "express";
import { BaseRoute } from "../../routes/route";

export class Predictor extends BaseRoute {

  constructor() {
    super();
  }


  // predict
  // Searches both collections for top 5 words, prioritizing local over global.
  public async predict(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    let wordsLocal = await this.predictLocal(req, res, next);

    if (wordsLocal.length === 5) {

      res.send(wordsLocal);

    } else {

      let wordsFinal = wordsLocal;
      let wordsGlobal = await this.predictGlobal(req, res, next);

      for (let i = 0; i < wordsGlobal.length; i++) {
        let exists: boolean;

        for (let j = 0; j < wordsLocal.length; j++) {

          if (wordsGlobal[i].word === wordsLocal[j].word) {
            exists = true;
          }

          if (exists) break;

        }

        if (!exists) {
          wordsFinal.push(wordsGlobal[i]);
          if (wordsFinal.length >= 5) break;
        }

      }
      res.send(wordsFinal);

    }

  }

  // predictLocal
  // Searches local database for top 5 words that start with a given string, sorts
  // them by rank (descending) and word length (ascending), limits the query to
  // 5 items, then returns an array of the result.
  public predictLocal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Array<any>> {

    let query = new RegExp("^" + req.body.text, "i");

    return new Promise( resolve => {
      this.getMongoAccess(res)
      .predictor_user(req['user'].userId)
      .subscribe( col => {

        col
          .aggregate([

            {
              $project: {
                "word" : 1,
                "rank" : 1,
                "length" : { $strLenCP: "$word" }
              }
            },

            {
              $match: { "word": query }
            },

          ])
          .collation({"locale": "pt"})
          .sort(
            {
              "rank" : -1,
              "length" : 1,
              "word": 1
            }
          )
          .limit(5)
          .toArray( (err: any, words: any) => {

            resolve(words);

          });

      });
    });

  }

  // predictGlobal
  // Searches global database for top 10 words that start with a given string, sorts
  // them by rank (descending) and word length (ascending), limits the query to
  // 10 items, then returns an array of the result.
  public predictGlobal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Array<any>> {

    let query = new RegExp("^" + req.body.text, "i");

    return new Promise( resolve => {
      this.getMongoAccess(res)
      .predictor_pt_br()
      .subscribe( col => {

        col
          .aggregate([

            {
              $project: {
                "word" : 1,
                "rank" : 1,
                "length" : { $strLenCP: "$word" }
              }
            },

            {
              $match: { "word": query }
            },

          ])
          .collation({"locale": "pt"})
          .sort(
            {
              "rank" : -1,
              "length" : 1,
              "word": 1
            }
          )
          .limit(10)
          .toArray( (err: any, words: any) => {

            resolve(words);

          });

      });
    });

  }

  // addOrUpdateWord
  // Searches local database for a given word. If it exists, the word's rank is
  // incremented by one, else the word is added to the database.
  public addOrUpdateWord(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    let word = req.body.text;

    this.getMongoAccess(res)
      .predictor_user(req['user'].userId)
      .subscribe( col => {

        col
          .find(
            { "word" : word }
          )
          .toArray( (err: any, result: any) => {

            if (result.length === 0) {
              this.addNewWord(word, res, req);
            } else {
              this.incrementWordRank(word, res, req);
            }

          });

      });

  }

  // removeOrUpdateWord
  // Searches database for a given word. If the word is found and was added by
  // the user, it checks for the word's rank. If it's higher than 1, the word's
  // rank is decremented by one, else the word is deleted from the database.
  // If the word was not added by the user and it's rank is higher than 0, the
  // word's rank is decremented by one.
  public removeOrUpdateWord(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    let word = req.body.text;

    this.getMongoAccess(res)
      .predictor_pt_br()
      .subscribe( col => {

        col
          .find(
            { "word" : word }
          )
          .toArray( (err: any, result: any) => {

            if (result.length !== 0) {

              if(result[0].addedByUser) {

                if(result[0].rank > 1){
                  this.decrementWordRank(word, res)
                } else {
                  this.removeWord(word, res)
                }

              } else {

                if (result[0].rank > 0 ){
                  this.decrementWordRank(result[0].word, res)
                }

              }

            }

          });

      });

  }

  // addNewWord
  // Adds a given word to the local database. "rank" is set to 1 and a flag indicating
  // the word was added by a user is added.
  addNewWord(word: string, res: Response, req: Request) {

    this.getMongoAccess(res)
      .predictor_user(req['user'].userId)
      .subscribe( col => {

        col
          .insert(
            {
              "rank": 1,
              "word": word,
              "addedByUser": true
            }
          );

      });

  }

  // removeWord
  // Removes a word from the database. Should only be called if the word was
  // added by a user.
  removeWord(word: string, res: Response) {

    this.getMongoAccess(res)
      .predictor_pt_br()
      .subscribe( col => {

        col
          .deleteOne(
            {
              "word" : word
            }
          );

      });

  }

  // incrementWordRank
  // Increments a given word's rank by one.
  incrementWordRank(word: string, res: Response, req: Request) {
    this.getMongoAccess(res)
      .predictor_user(req['user'].userId)
      .subscribe( col => {

        col
          .updateOne(
            {
              "word" : word
            },
            {
              $inc : {
                "rank" : 1
              }
            }
          );

      });

  }

  // decrementWordRank
  // Decrements a given word's rank by one. Should only be called if the word's
  // rank is higher than 0.
  decrementWordRank(word: string, res: Response) {

    this.getMongoAccess(res)
    .predictor_pt_br()
    .subscribe( col => {

      col
        .updateOne(
          {
            "word" : word
          },
          {
            $inc : {
              "rank" : -1
            }
          }
        );

    });

  }

  // getInitialWords
  // Searches db for the most used words and returns them.
  public async getInitialWords(
    req: Request,
    res: Response,
    next: NextFunction
  ) {

    let wordsLocal = await this.getInitialWordsLocal(req, res, next);

    if (wordsLocal.length === 5) {

      res.send(wordsLocal);

    } else {

      let wordsFinal = wordsLocal;
      let wordsGlobal = await this.getInitialWordsGlobal(req, res, next);

      for (let i = 0; i < wordsGlobal.length; i++) {
        let exists: boolean;

        for (let j = 0; j < wordsLocal.length; j++) {

          if (wordsGlobal[i].word === wordsLocal[j].word) {
            exists = true;
          }

          if (exists) break;

        }

        if (!exists) {
          wordsFinal.push(wordsGlobal[i]);
          if (wordsFinal.length >= 5) break;
        }

      }

      res.send(wordsFinal);

    }

  }

  // getInitialWordsLocal
  // Searches local db for the most used words and returns them.
  public getInitialWordsLocal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Array<any>> {

    return new Promise( resolve => {
    this.getMongoAccess(res)
      .predictor_user(req['user'].userId)
      .subscribe( col => {

        col
          .aggregate([

            {
              $project: {
                "word" : 1,
                "rank" : 1,
                "length" : { $strLenCP: "$word" }
              }
            },

          ])
          .collation({"locale": "pt"})
          .sort(
            {
              "rank" : -1,
              "length" : 1,
              "word": 1
            }
          )
          .limit(5)
          .toArray( (err: any, words: any) => {

            resolve(words);

          });

      });

    });

  }

  // getInitialWordsGlobal
  // Searches global db for the most used words and returns them.
  public getInitialWordsGlobal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Array<any>> {

    return new Promise( resolve => {
    this.getMongoAccess(res)
      .predictor_pt_br()
      .subscribe( col => {

        col
          .aggregate([

            {
              $project: {
                "word" : 1,
                "rank" : 1,
                "length" : { $strLenCP: "$word" }
              }
            },

          ])
          .collation({"locale": "pt"})
          .sort(
            {
              "rank" : -1,
              "length" : 1,
              "word": 1
            }
          )
          .limit(5)
          .toArray( (err: any, words: any) => {

            resolve(words);

          });

      });

    });

  }

}
