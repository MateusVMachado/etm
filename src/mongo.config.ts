import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./routes/route";
import { KeyboardModel } from './models/keyboard.model';

export class MongoConfig {

    public sys_teclados: KeyboardModel = new KeyboardModel(); 
    public sys_teclados1: KeyboardModel = new KeyboardModel();
    public sys_teclados2: KeyboardModel = new KeyboardModel();  
    public all_op: any[] = [];

    constructor(){
        this.sys_teclados.teclas = [];
        this.sys_teclados1.teclas = [];
        this.sys_teclados2.teclas = [];
    }

    
    public configureDatabase(req: Request, res: Response, next: NextFunction) {
        // COnfigura os teclados básicos
        
        //this.sys_teclados = this.loadKeyboard('normal');
        //this.sys_teclados = this.loadKeyboard('caps');
        //this.sys_teclados = this.loadKeyboard('custom');
        //this.sys_teclados = this.loadKeyboard('en-us');        
        this.sys_teclados = this.loadKeyboard('en-us-caps');
        res.locals.mongoAccess.coll[1].insert(this.sys_teclados,  (err, result) => {
            console.log("Teclado inserido na database");
        });

        //res.locals.mongoAccess.coll[1].insert(this.sys_teclados2, (err, result) => {
        //    console.log("Teclado inserido na database");
        //});
        
        /*
        this.sys_teclados = this.loadKeyboard('normal');
        res.locals.mongoAccess.coll[1].insertOne(this.sys_teclados, (err, result) => {
            console.log("Teclado inserido na database");
        });

        this.sys_teclados = this.loadKeyboard('caps');
        res.locals.mongoAccess.coll[1].insertOne(this.sys_teclados, (err, result) => {
            console.log("Teclado inserido na database");
        });

        this.sys_teclados = this.loadKeyboard('custom');
        res.locals.mongoAccess.coll[1].insertOne(this.sys_teclados, (err, result) => {
            console.log("Teclado inserido na database");
        });

        this.sys_teclados = this.loadKeyboard('en-us');
        res.locals.mongoAccess.coll[1].insertOne(this.sys_teclados, (err, result) => {
            console.log("Teclado inserido na database");
        });

        this.sys_teclados = this.loadKeyboard('en-us-caps');
        res.locals.mongoAccess.coll[1].insertOne(this.sys_teclados, (err, result) => {
            console.log("Teclado inserido na database");
        });
        */

        /*  
        var mongodb = require('mongodb') , MongoClient = mongodb.MongoClient
        const myAwesomeDB = '';
        MongoClient.connect(process.env.MONGOHQ_URL|| 'mongodb://localhost:27017',
             function(err, database) {  
                var db = database.db('etm-database');
                db.collection('keyboards').insert(user, (err, result) => {
                    console.log("Keyboard inserido")
            })
        })
        */
    } 

    public loadKeyboard(type: string){
        this.sys_teclados.teclas = [];
        this.sys_teclados.type = 'none';
        // teclado PT-BR
        let row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
        let pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
        let sRow: string[] = ['*cpslck', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn'];
        let tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\''];
    
        // teclado PT-BR - Caps
        let crow: string[] = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '*bckspc'];
        let cpRow: string[] = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
        let csRow: string[] = ['*cpslck', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç',  ':', '*kbdrtrn'];
        let ctRow: string[] = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '\"'];

        // Teclado User Defined
        let customRow: string[] = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '*bckspc'];
        let customPRow: string[] = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
        let customSRow: string[] = ['A', 'S', 'D', 'L', ':', '*kbdrtrn'];
        let customTRow: string[] = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '\"'];

        // teclado EN-US 
        let engRow: string[] = ['\`', '!', '@', '#', '$', '%', '¨', '&', '*', '(', ')', '_', '+', '*bckspc'];
        let engPRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
        let engSRow: string[] = ['*cpslck', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '*kbdrtrn'];
        let engTRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];
    
        // teclado EN-US - Caps  
        let engcRow: string[] = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '*bckspc'];
        let engcPRow: string[] = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
        let engcSRow: string[] = ['*cpslck', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '\"', '*kbdrtrn'];
        let engcTRow: string[] = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?'];


        this.sys_teclados.teclas = []; // Clear teclado
    
        if ( type === 'normal') {
            this.sys_teclados.teclas.push(row);
            this.sys_teclados.teclas.push(pRow);
            this.sys_teclados.teclas.push(sRow);
            this.sys_teclados.teclas.push(tRow);
            this.sys_teclados.type = 'normal';
        } else if ( type === 'caps') {
            this.sys_teclados.teclas.push(crow);
            this.sys_teclados.teclas.push(cpRow);
            this.sys_teclados.teclas.push(csRow);
            this.sys_teclados.teclas.push(ctRow);
            this.sys_teclados.type = 'caps';
        } else if ( type === 'custom') {
            this.sys_teclados.teclas.push(customRow);
            this.sys_teclados.teclas.push(customPRow);
            this.sys_teclados.teclas.push(customSRow);
            this.sys_teclados.teclas.push(customTRow);
            this.sys_teclados.type = 'custom';
        } else if ( type === 'en-us') {
            this.sys_teclados.teclas.push(engRow);
            this.sys_teclados.teclas.push(engPRow);
            this.sys_teclados.teclas.push(engSRow);
            this.sys_teclados.teclas.push(engTRow);
            this.sys_teclados.type = 'en-us';
        } else if ( type === 'en-us-caps') {
            this.sys_teclados.teclas.push(engcRow);
            this.sys_teclados.teclas.push(engcPRow);
            this.sys_teclados.teclas.push(engcSRow);
            this.sys_teclados.teclas.push(engcTRow);
            this.sys_teclados.type = 'en-us-caps';
        }
    
        return this.sys_teclados;
    
    }  





}