import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "../../routes/route";
import { KeyboardModel } from '../../models/keyboard.model';
import { OpenFACLayout, LayoutLine, LayoutButton } from '../../models/layout.model';
import { KeyboardNamesList } from "./keyboard-list.model";
import { isNull } from "util";


export class Keyboard extends BaseRoute {
    
    constructor() {
        super();
    }
    
    
    public getSingleKeyboardByName(req: Request, res: Response, next: NextFunction){
        
        
            this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {
        if(req.query.nameLayout === "pt-br"){
            keyboardCollection.find({ $and: [{"nameLayout": req.query.nameLayout}, {"email": "system"} ] } ).toArray(function(err, keyboard) {
                res.send(keyboard);
            });
        }else {
            keyboardCollection.find({ $and: [{"nameLayout": req.query.nameLayout}, {"email": req.query.email} ] } ).toArray(function(err, keyboard) {
                res.send(keyboard);
            })
        }    

        
      });
      
      
    }
    
    public getSingleKeyboardByEmail(req: Request, res: Response, next: NextFunction){
        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {
        keyboardCollection.find({ $and: [{"email": req.query.email} ] } ).toArray(function(err, keyboard) {
            res.send(keyboard);
        })
      });
        
    }
    public getMultipleKeyboard(req: Request, res: Response, next: NextFunction){
        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {
        keyboardCollection.find({ $and: [{"shared": "true"} ] } ).toArray(function(err, keyboard_list) {
            res.send(keyboard_list);
        })
      });
    }
    
    public getKeyboardNames(req: Request, res: Response, next: NextFunction){
        let keyboardNames = new KeyboardNamesList();

        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {
        keyboardCollection.find({ $or: [{"email": req.query.email}, {"email": "system"}] }).toArray(function(err, keyboard_list) {
            if(keyboard_list.length !== 0){
                for(let i = 0; i < keyboard_list.length; i++){
                    keyboardNames.KeyboardsNames.push(keyboard_list[i].nameLayout);
                }
                res.send(keyboardNames);
            }     
        })
      });
        
      
    }
    
    public keyboard_api(req: Request, res: Response, next: NextFunction) {    
        let teclado: KeyboardModel = new KeyboardModel();                
        this.getInDatabase(teclado, res);
    }
    
    
    public getInDatabase(teclado: KeyboardModel, res: Response){  
        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {
        keyboardCollection.find().toArray(function(err, keyboard_list) {
            
                res.send(keyboard_list);
                   
        })
      });
        
      
    }
    
    public getKeyboardByUser(req: Request, res: Response, next: NextFunction){
        if(req.query.email){
            
            this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {
        keyboardCollection.find( { $or: [{ "email": req.query.email }, { "email": "system" }]}).toArray(function(err, keyboard_list) {
            
                res.send(keyboard_list);
             
        })
      });
      
        }    
    }
    
    public deleteKeyboard(req: Request, res: Response, next: NextFunction){
        if(req.query.email){

            this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {

        keyboardCollection.find({ "nameLayout": req.query.nameLayout,  "email": req.query.email }).toArray(function(err, keyboard_list) { 
            if(keyboard_list){
                keyboardCollection.remove({ nameLayout: req.query.nameLayout,  email: req.query.email }, true);
                res.send('removed');
            } else {
                res.send('notFound');   
            }
            
        }); 

      });
            
                      
        }
    }     
    
    public insertNewKeyboard(req: Request, res: Response, next: NextFunction){

        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {

        keyboardCollection.find({ "email": req.query.email }).toArray(function(err, keyboard_list) { 
            if(keyboard_list.length >= 7){
                res.send("maxNumber");
            } else {
                keyboardCollection.find( { $and: [{ "nameLayout": req.query.nameLayout }, {"email": req.query.email}] }).toArray(function(err, keyboard_list) {
                    if(keyboard_list.length !== 0){
                    } else {
                        keyboardCollection.insert(req.body, (err, result) => {
                            if(isNull(err)){
                                res.send("saved");
                            }
                            else{
                                res.send("error");
                            }
                        })
                    }
                })
            }
        })

      });
    }
    
    public insertUpdateKeyboard(req: Request, res: Response, next: NextFunction){
        let newKeyboard = req.body;

        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {

        keyboardCollection.find({ "email": req.query.email }).toArray(function(err, keyboard_list) { 
            if(keyboard_list.length >= 8){
                res.send('maxNumber');
                return;
            } else {
                keyboardCollection.update({ $and: [{ "nameLayout": req.query.nameLayout }, {"email": req.query.email} ]}, newKeyboard, (err, result) => {
                    res.send('updated');
                })
                
            }
        })

      });
        
        
    }
    
    public insertUpdateOnlyKeyboard(req: Request, res: Response, next: NextFunction){
        let newKeyboard = req.body;

        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {

        keyboardCollection.find({ "email": req.query.email }).toArray(function(err, keyboard_list) { 
            keyboardCollection.update({ $and: [{ "nameLayout": req.query.nameLayout }, {"email": req.query.email} ]}, newKeyboard, (err, result) => {
                res.send('updated');
            })
        })

      });
        
        
    }
    
    public insertBasicAtRegister(req: Request,  res: Response, next: NextFunction){
        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {
        keyboardCollection.insert(this.populateLayout('pt-br', req.body.email), (err, result) => {
        })
      });
        
    }    
    
    
    public insertBasicIntoDatabase(req: Request,  res: Response, next: NextFunction){
        this.getMongoAccess(res)
      .keyboards()
      .subscribe(keyboardCollection => {
        keyboardCollection.insert(this.populateLayout('pt-br'), (err, result) => {
        })
      });
        
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
                openFacLayout.Lines[i].Buttons[j].Action = teclado.action[i][j];        
                openFacLayout.Lines[i].Buttons[j].Caption = teclado.teclas[i][j];        
                openFacLayout.Lines[i].Buttons[j].Text = teclado.text[i][j];
                openFacLayout.Lines[i].Buttons[j].Image = teclado.image[i][j];        
            }
        } 
        
        return openFacLayout;
    }
    
    
    // FUNCAO PARA TESTES APENAS
    public loadKeyboard(type: string): KeyboardModel {
        let teclado = new KeyboardModel();
        
        
        var row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
        var pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
        var sRow: string[] = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*kbdrtrn', 'PULA', '*arrowdown'];
        var tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '*arrowleft', '*arrowright', '*arrowup'];
        var zRow: string[] = ['*mic', '*space'];
        
        var rowKey: string[] = ['Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 
        'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard'];
        var pRowKey: string[] = ['Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard',
        'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard'];
        var sRowKey: string[] = ['Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 
        'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard'];
        var tRowKey: string[] = ['Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 'Keyboard', 
        'Keyboard', 'Keyboard', 'Keyboard'];
        var zRowKey: string[] = ['TTS', 'Keyboard'];
        
        
        var rowImg: string[] = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
        var pRowImg: string[] = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
        var sRowImg: string[] = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
        var tRowImg: string[] = ['', '', '', '', '', '', '', '', '', '', '', '', ''];
        var zRowImg: string[] = ['', ''];
        
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
            
            
            teclado.action.push(rowKey);
            teclado.action.push(pRowKey);
            teclado.action.push(sRowKey);
            teclado.action.push(tRowKey);
            teclado.action.push(zRowKey);
            
            teclado.image.push(rowImg);
            teclado.image.push(pRowImg);
            teclado.image.push(sRowImg);
            teclado.image.push(tRowImg);
            teclado.image.push(zRowImg);
            
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