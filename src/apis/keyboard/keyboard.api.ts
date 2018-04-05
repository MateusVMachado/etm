import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../../routes/route";
import { KeyboardModel } from '../../models/keyboard.model';
import { OpenFACLayout, LayoutLine, LayoutButton } from '../../models/layout.model';
import { KeyboardNamesList } from "./keyboard-list.model";


export class Keyboard extends BaseRoute {

    constructor() {
        super();
    }
    

    public getSingleKeyboardByName(req: Request, res: Response, next: NextFunction){
        let instance = this;

        if(req.query.nameLayout === "pt-br"){
            res.locals.mongoAccess.coll[1].find({ $and: [{"nameLayout": req.query.nameLayout}, {"email": "system"} ] } ).toArray(function(err, keyboard) {
                res.send(keyboard);
            })    
        } else {
            res.locals.mongoAccess.coll[1].find({ $and: [{"nameLayout": req.query.nameLayout}, {"email": req.query.email} ] } ).toArray(function(err, keyboard) {
                res.send(keyboard);
            })
        }    

    }


    public getKeyboardNames(req: Request, res: Response, next: NextFunction){
        let teclado: KeyboardModel = new KeyboardModel();
        this.getKeyboardNamesInDatabase(teclado, req, res);        
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
                    //instance.insertBasicIntoDatabase(teclado, res);
                }         
            })
     }

    public getKeyboardNamesInDatabase(teclado: KeyboardModel, req: Request, res: Response){    
        let instance = this;
        let keyboardNames = new KeyboardNamesList();

            res.locals.mongoAccess.coll[1].find({ $or: [{"email": req.query.email}, {"email": "system"}] }).toArray(function(err, keyboard_list) {
                if(keyboard_list.length !== 0){
                    for(let i = 0; i < keyboard_list.length; i++){
                        keyboardNames.KeyboardsNames.push(keyboard_list[i].nameLayout);
                    }
                    res.send(keyboardNames);
                }     
            })
    }

    public getKeyboardByUser(req: Request, res: Response, next: NextFunction){
        let instance = this;

        if(req.query.email){
                res.locals.mongoAccess.coll[1].find( { $or: [{ "email": req.query.email }, { "email": "system" }]}).toArray(function(err, keyboard_list) {
                    if(keyboard_list.length !== 0){
                        res.send(keyboard_list);
                    }  
                })
        }    
    }



    public deleteKeyboard(req: Request, res: Response, next: NextFunction){
        if(req.query.email){

                res.locals.mongoAccess.coll[1].find({ "nameLayout": req.query.nameLayout,  "email": req.query.email }).toArray(function(err, keyboard_list) { 
                    if(keyboard_list){
                        res.locals.mongoAccess.coll[1].remove({ nameLayout: req.query.nameLayout,  email: req.query.email }, true);
                        res.send('removed');
                    } else {
                        res.send('notFound');   
                    }
                    
                });           
        }
    }     
    

    public insertNewKeyboard(req: Request, res: Response, next: NextFunction){
        let newKeyboard = req.body;

        res.locals.mongoAccess.coll[1].find({ "email": req.query.email }).toArray(function(err, keyboard_list) { 
            if(keyboard_list.length >= 7){
                res.send('maxNumber');
                return;
            } else {
                res.locals.mongoAccess.coll[1].find( { $and: [{ "nameLayout": req.query.nameLayout }, {"email": req.query.email}] }).toArray(function(err, keyboard_list) {
                    if(keyboard_list.length !== 0){
                        res.send('alreadyExist');
                    } else {
                        res.locals.mongoAccess.coll[1].insert(newKeyboard, (err, result) => {
                            console.log("Keyboard inserido");
                            res.send('saved');
                        })
                    }
                 })
            }
        })


    }

    public insertUpdateKeyboard(req: Request, res: Response, next: NextFunction){
        let newKeyboard = req.body;

        res.locals.mongoAccess.coll[1].find({ "email": req.query.email }).toArray(function(err, keyboard_list) { 
            if(keyboard_list.length >= 8){
                res.send('maxNumber');
                return;
            } else {
                        res.locals.mongoAccess.coll[1].update({ $and: [{ "nameLayout": req.query.nameLayout }, {"email": req.query.email} ]}, newKeyboard, (err, result) => {
                            console.log("Keyboard atualizado");
                            res.send('updated');
                        })

            }
        })
    }

    public insertUpdateOnlyKeyboard(req: Request, res: Response, next: NextFunction){
        let newKeyboard = req.body;

        res.locals.mongoAccess.coll[1].find({ "email": req.query.email }).toArray(function(err, keyboard_list) { 
                        res.locals.mongoAccess.coll[1].update({ $and: [{ "nameLayout": req.query.nameLayout }, {"email": req.query.email} ]}, newKeyboard, (err, result) => {
                            console.log("Keyboard atualizado");
                            res.send('updated');
                        })
        })
    }

    public insertBasicAtRegister(req: Request,  res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[1].insert(this.populateLayout('pt-br', req.body.email), (err, result) => {
            console.log("Keyboard inserido")
        })
    }    


    public insertBasicIntoDatabase(req: Request,  res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[1].insert(this.populateLayout('pt-br'), (err, result) => {
            console.log("Keyboard inserido")
        })
        //res.locals.mongoAccess.coll[1].insert(this.populateLayout('caps'), (err, result) => {
        //    console.log("Keyboard inserido")
        //})
        //res.locals.mongoAccess.coll[1].insert(this.populateLayout('user'), (err, result) => {
        //    console.log("Keyboard inserido")
        //})
        //res.locals.mongoAccess.coll[1].insert(this.populateLayout('exp'), (err, result) => {
        //    console.log("Keyboard inserido")
        //})
     } 

    public populateLayout(type: string, email?:string): OpenFACLayout{
        let openFacLayout = new OpenFACLayout(); 
        openFacLayout.nameLayout = type;
        if(email){
            openFacLayout.email = email;    
        } else {
            openFacLayout.email = 'system'; 
        }
        

        let teclado = this.loadKeyboard(type);
        let qntyLines = teclado.teclas.length;

        openFacLayout.Lines = new Array<LayoutLine>();
        for(let i = 0; i < qntyLines; i++){
            openFacLayout.Lines.push(new LayoutLine());
            openFacLayout.Lines[i].Buttons = new Array<LayoutButton>();
            for( let j = 0 ; j < teclado.teclas[i].length; j++){
                    openFacLayout.Lines[i].Buttons.push(new LayoutButton());
                    openFacLayout.Lines[i].Buttons[j].Action = 'Keyboard';
                    openFacLayout.Lines[i].Buttons[j].Caption = teclado.teclas[i][j];        
                    openFacLayout.Lines[i].Buttons[j].Text = teclado.text[i][j];        
            }
        } 

        return openFacLayout;
     }


    // FUNCAO PARA TESTES APENAS
    public loadKeyboard(type: string): KeyboardModel {
        let teclado = new KeyboardModel();
        
        
        var row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
        var pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
        var sRow: string[] = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn', 'PULA'];
        var tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '*arrowleft', '*arrowright', '*arrowup'];
        var zRow: string[] = ['*arrowdown', '*space'];
    
        var crow: string[] = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '*bckspc'];
        var cpRow: string[] = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
        var csRow: string[] = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç',  ':', '*kbdrtrn'];
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

            teclado.text.push(row);
            teclado.text.push(pRow);
            teclado.text.push(sRow);
            teclado.text.push(tRow);
            teclado.text.push(zRow);
            teclado.type = 'pt-br';
        } else if ( type === 'caps') {
            teclado.teclas.push(crow);
            teclado.teclas.push(cpRow);
            teclado.teclas.push(csRow);
            teclado.teclas.push(ctRow);
            teclado.teclas.push(czRow);

            teclado.text.push(crow);
            teclado.text.push(cpRow);
            teclado.text.push(csRow);
            teclado.text.push(ctRow);
            teclado.text.push(czRow);
            
            teclado.type = 'caps';
        } else if ( type === 'user') {
            teclado.teclas.push(user);
            teclado.teclas.push(puser);
            teclado.teclas.push(suser);
            teclado.teclas.push(tuser);
            teclado.teclas.push(zuser);

            teclado.text.push(user);
            teclado.text.push(puser);
            teclado.text.push(suser);
            teclado.text.push(tuser);
            teclado.text.push(zuser);
            teclado.type = 'user';
        } else if ( type === 'exp') {
            teclado.teclas.push(exp);
            teclado.teclas.push(pexp);
            teclado.teclas.push(sexp);
            teclado.teclas.push(texp);

            teclado.text.push(exp);
            teclado.text.push(pexp);
            teclado.text.push(sexp);
            teclado.text.push(texp);
            teclado.type = 'exp';
        }
    
        return teclado;
    
    }  




}




