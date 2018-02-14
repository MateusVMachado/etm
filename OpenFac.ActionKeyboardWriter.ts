import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';

export class OpenFacActionKeyboardWriter implements IOpenFacAction { 

    private document: any;

    public Execute(Engine: IOpenFacEngine){
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        let str = bt.Text;

        // IMPLEMENTAR A FUNÇÃO ABAIXO:
        //SendKeys.SendWait(str);
    }

    public OpenFacActionKeyboardWriter(document: any){
        this.document = document;
    }

    public static Create(): IOpenFacAction {
        return new OpenFacActionKeyboardWriter();
    }
}