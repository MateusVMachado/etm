import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../routes/route";
import { KeyboardModel } from '../models/keyboard.model';
import { OpenFACLayout, LayoutLine, LayoutButton } from '../models/layout.model';


export class Keyboard extends BaseRoute{

    public title: string;
    public teclado: KeyboardModel = new KeyboardModel();


    constructor() {
        super();
        this.teclado.teclas = [];
    }


    public keyboard_api(req: Request, res: Response, next: NextFunction) {    
        this.title = "Home | ETM - BackEnd";
        this.getInDatabase(this.teclado, res);
      }

    public getInDatabase(teclado: KeyboardModel, res: Response){    
            let instance = this;
            res.locals.mongoAccess.coll[1].find().toArray(function(err, keyboard_list) {
                if(keyboard_list.length !== 0){
                    res.send(keyboard_list);
                } else {
                    instance.insertBasicIntoDatabase(teclado, res);
                }         
            })
     }

    public insertBasicIntoDatabase(teclado: KeyboardModel, res: Response){
        res.locals.mongoAccess.coll[1].insert(this.populateLayout('pt-br'), (err, result) => {
            console.log("Keyboard inserido")
        })
        res.locals.mongoAccess.coll[1].insert(this.populateLayout('caps'), (err, result) => {
            console.log("Keyboard inserido")
        })
        res.locals.mongoAccess.coll[1].insert(this.populateLayout('user'), (err, result) => {
            console.log("Keyboard inserido")
        })
        res.locals.mongoAccess.coll[1].insert(this.populateLayout('exp'), (err, result) => {
            console.log("Keyboard inserido")
        })
     } 

    public populateLayout(type: string): OpenFACLayout{
        let openFacLayout = new OpenFACLayout(); 
        openFacLayout.nameLayout = type;
        openFacLayout.email = 'email.teste@email.com'; 

        let teclado = this.loadKeyboard(type);
        let qntyLines = teclado.teclas.length;

        openFacLayout.Lines = new Array<LayoutLine>();
        for(let i = 0; i < qntyLines; i++){
            openFacLayout.Lines.push(new LayoutLine());
            openFacLayout.Lines[i].Buttons = new Array<LayoutButton>();
            for( let j = 0 ; j < this.teclado.teclas[i].length; j++){
                    openFacLayout.Lines[i].Buttons.push(new LayoutButton());
                    openFacLayout.Lines[i].Buttons[j].Action = 'Keyboard';
                    openFacLayout.Lines[i].Buttons[j].Caption = 'caption';
                    openFacLayout.Lines[i].Buttons[j].Text = this.teclado.teclas[i][j];
            }
        } 

        return openFacLayout;
     }


    // FUNCAO PARA TESTES APENAS
    public loadKeyboard(type: string){

        var row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
        var pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
        var sRow: string[] = ['*cpslck', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn'];
        var tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\''];
        var zRow: string[] = ['*space'];
    
        var crow: string[] = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '*bckspc'];
        var cpRow: string[] = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
        var csRow: string[] = ['*cpslck', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç',  ':', '*kbdrtrn'];
        var ctRow: string[] = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '\"'];
        var czRow: string[] = ['*space'];

        var user: string[] = ['\'', '1', '2', '3', '4'];
        var puser: string[] = ['*tab', 'q', 'w', 'e'];
        var suser: string[] = ['a', 's', 'd', '*kbdrtrn'];
        var tuser: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
        var zuser: string[] = ['*space'];

        var exp: string[] = ['\'', '1', '2'];
        var pexp: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u'];
        var sexp: string[] = ['l', '*kbdrtrn'];
        var texp: string[] = ['*arrowleft', '*arrowright', '*arrowup', '*arrowdown'];

        this.teclado.teclas = []; // Clear teclado
    
        if ( type === 'pt-br') {
            this.teclado.teclas.push(row);
            this.teclado.teclas.push(pRow);
            this.teclado.teclas.push(sRow);
            this.teclado.teclas.push(tRow);
            this.teclado.teclas.push(zRow);
            this.teclado.type = 'pt-br';
        } else if ( type === 'caps') {
            this.teclado.teclas.push(crow);
            this.teclado.teclas.push(cpRow);
            this.teclado.teclas.push(csRow);
            this.teclado.teclas.push(ctRow);
            this.teclado.teclas.push(czRow);
            this.teclado.type = 'caps';
        } else if ( type === 'user') {
            this.teclado.teclas.push(user);
            this.teclado.teclas.push(puser);
            this.teclado.teclas.push(suser);
            this.teclado.teclas.push(tuser);
            this.teclado.teclas.push(zuser);
            this.teclado.type = 'user';
        } else if ( type === 'exp') {
            this.teclado.teclas.push(exp);
            this.teclado.teclas.push(pexp);
            this.teclado.teclas.push(sexp);
            this.teclado.teclas.push(texp);
            this.teclado.type = 'exp';
        }
    
        return this.teclado;
    
    }  




}




