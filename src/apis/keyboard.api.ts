import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../routes/route";
import { KeyboardModel } from '../models/keyboard.model';
//import { MongoAccessModel } from "../models/mongoAccess.model";


export class Keyboard extends BaseRoute{

    public title: string;
    public teclado: KeyboardModel = new KeyboardModel();


    constructor() {
        super();
        this.teclado.teclas = [];
    }


    public keyboard_api(req: Request, res: Response, next: NextFunction) {    
        this.title = "Home | ETM - BackEnd";

        // DESCOMENTAR LINHA ABAIXO SE NAO FOR FAZER O TESTE ABAIXO!!
        this.getInDatabase(this.teclado, res);

                 /////////////////////////
                // USADO PARA TESTES   //
               /////////////////////////
                //this.teclado = this.loadKeyboard('normal');
                //this.insertIntoDatabase(this.teclado);
            ///   FIM DOS TESTES   /// 
           // COMENTAR AO TERMINAR //  
      }


    public getInDatabase(teclado: KeyboardModel, res: Response){    
            res.locals.mongoAccess.coll[1].find({}).toArray(function(err, keyboard_list) {         
                    teclado.teclas = keyboard_list[0].teclas
                    teclado.type = keyboard_list[0].type                
                    res.send(teclado);
            })
     }

    
    insertIntoDatabase(teclado: KeyboardModel){
        var mongodb = require('mongodb') , MongoClient = mongodb.MongoClient
        const myAwesomeDB = '';
        MongoClient.connect(process.env.MONGOHQ_URL|| 'mongodb://localhost:27017',
             function(err, database) {  
                var db = database.db('etm-database');
                db.collection('keyboards').insert(teclado, (err, result) => {
                    console.log("Keyboard inserido")
            })
        })
    }     

    // FUNCAO PARA TESTES APENAS
    public loadKeyboard(type: string){

        var row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
        var pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
        var sRow: string[] = ['*cpslck', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn'];
        var tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\''];
    
        var crow: string[] = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '*bckspc'];
        var cpRow: string[] = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
        var csRow: string[] = ['*cpslck', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç',  ':', '*kbdrtrn'];
        var ctRow: string[] = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '\"'];
        this.teclado.teclas = []; // Clear teclado
    
        if ( type === 'normal') {
            this.teclado.teclas.push(row);
            this.teclado.teclas.push(pRow);
            this.teclado.teclas.push(sRow);
            this.teclado.teclas.push(tRow);
            this.teclado.type = 'normal';
        } else if ( type === 'caps') {
            this.teclado.teclas.push(crow);
            this.teclado.teclas.push(cpRow);
            this.teclado.teclas.push(csRow);
            this.teclado.teclas.push(ctRow);
            this.teclado.type = 'caps';
        }
    
        return this.teclado;
    
    }  




}




