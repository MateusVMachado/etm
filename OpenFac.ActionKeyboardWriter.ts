
import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';

import { EditorInstance } from '../../src/app/storage';
import { EventEmitter } from 'events';
import { Output } from '@angular/core';

export class OpenFacActionKeyboardWriter implements IOpenFacAction { 

    @Output() public returnedEvent = new EventEmitter();
    public document: any;
    public text: string = '';

    constructor(document: any){

        this.document = document;
    
        this.document.textContent = "HELLOOOO3";
    }


    public Execute(Engine: IOpenFacEngine){
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        let str = bt.Text;
 
        console.log("STR: " + str);
        //console.log(this.document);
        this.document += str;
        //this.text += str;

        //console.log(this.text);

        //console.log(this.document);
    
        // IMPLEMENTAR A FUNÇÃO ABAIXO:
        //SendKeys.SendWait(str);
    }

    //public OpenFacActionKeyboardWriter(document: any){
    //    document.textContent = "HELLOOOO3";
        //console.log('criando...');
        //console.log(document);
        //this.document = document;
        //console.log(this.document);
    //}

    //public static Create(): IOpenFacAction {
    //    return new OpenFacActionKeyboardWriter(document);
   // }
}