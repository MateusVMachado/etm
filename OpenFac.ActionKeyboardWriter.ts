
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
        console.log("MARK4");
        console.log(this.document)

    }


    public Execute(Engine: IOpenFacEngine){
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        let str = bt.Text;
 
        console.log("STR: " + str);

        this.document.insertText(str);

    }
}