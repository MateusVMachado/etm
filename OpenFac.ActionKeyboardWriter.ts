import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';

export class OpenFacActionKeyboardWriter implements IOpenFacAction {    
    
    constructor(private editor: any){        
    }

    public Execute(Engine: IOpenFacEngine){
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        this.editor.insertText(bt.Text);
    }
}