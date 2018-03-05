import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../../routes/route";
import { KeyboardModel } from '../../models/keyboard.model';
import { OpenFACLayout, LayoutLine, LayoutButton } from '../../models/layout.model';
import { KeyboardNamesList } from "./keyboard-list.model";


export class Keyboard extends BaseRoute{

    public title: string;    
    public names = new Array();

    constructor() {
        super();
    }
    
    public getKeyboardNames(req: Request, res: Response, next: NextFunction){
        let teclado: KeyboardModel = new KeyboardModel();
        this.getKeyboardNamesInDatabase(teclado, res);        
    }

    public keyboard_api(req: Request, res: Response, next: NextFunction) {    
        let teclado: KeyboardModel = new KeyboardModel();                
        this.getInDatabase(teclado, res);
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

    public getKeyboardNamesInDatabase(teclado: KeyboardModel, res: Response){    
        let instance = this;
        let keyboardNames = new KeyboardNamesList();
        res.locals.mongoAccess.coll[1].find().toArray(function(err, keyboard_list) {
            if(keyboard_list.length !== 0){
                for(let i = 0; i < keyboard_list.length; i++){
                    keyboardNames.KeyboardsNames.push(keyboard_list[i].nameLayout);
                }
                res.send(keyboardNames);
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
            for( let j = 0 ; j < teclado.teclas[i].length; j++){
                    openFacLayout.Lines[i].Buttons.push(new LayoutButton());
                    openFacLayout.Lines[i].Buttons[j].Action = 'Keyboard';
                    openFacLayout.Lines[i].Buttons[j].Caption = 'caption';
                    openFacLayout.Lines[i].Buttons[j].Text = teclado.teclas[i][j];
            }
        } 

        return openFacLayout;
     }


    // FUNCAO PARA TESTES APENAS
    public loadKeyboard(type: string): KeyboardModel {
        let teclado = new KeyboardModel();
        
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

        var exp: string[] = ['\'', '1', '*bckspc'];
        var pexp: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u'];
        var sexp: string[] = ['l', '*kbdrtrn'];
        var texp: string[] = ['*arrowleft', '*arrowright', '*arrowup', '*arrowdown'];

        teclado.teclas = []; // Clear teclado
    
        if ( type === 'pt-br') {
            teclado.teclas.push(row);
            teclado.teclas.push(pRow);
            teclado.teclas.push(sRow);
            teclado.teclas.push(tRow);
            teclado.teclas.push(zRow);
            teclado.type = 'pt-br';
        } else if ( type === 'caps') {
            teclado.teclas.push(crow);
            teclado.teclas.push(cpRow);
            teclado.teclas.push(csRow);
            teclado.teclas.push(ctRow);
            teclado.teclas.push(czRow);
            teclado.type = 'caps';
        } else if ( type === 'user') {
            teclado.teclas.push(user);
            teclado.teclas.push(puser);
            teclado.teclas.push(suser);
            teclado.teclas.push(tuser);
            teclado.teclas.push(zuser);
            teclado.type = 'user';
        } else if ( type === 'exp') {
            teclado.teclas.push(exp);
            teclado.teclas.push(pexp);
            teclado.teclas.push(sexp);
            teclado.teclas.push(texp);
            teclado.type = 'exp';
        }
    
        return teclado;
    
    }  




}




