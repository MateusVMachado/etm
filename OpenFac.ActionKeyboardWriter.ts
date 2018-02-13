import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';

export class OpenFacActionKeyboardWriter implements IOpenFacAction { 

    public Execute(Engine: IOpenFacEngine){
        let eg = <OpenFacEngine> Engine;
        let bt = eg.GetCurrentButton();
        let str = bt.Text;

        // IMPLEMENTAR A FUNÇÃO ABAIXO:
        //SendKeys.SendWait(str);
    }

    public static Create(): IOpenFacAction {
        return new OpenFacActionKeyboardWriter();
    }
}