import { IOpenFacAction } from './OpenFac.Action.Interface';
import { OpenFacActionFactory } from './OpenFac.ActionFactory';

export class OpenFacActionManager {
    private actionList: Map<string, IOpenFacAction> = new Map<string, IOpenFacAction>();
    public Add(actionName: string, IAction: IOpenFacAction): void {
        this.actionList.set(actionName, IAction);
    }
    public List(): Map<string, IOpenFacAction> {
        return this.actionList;
    }
    public Find(actionName: string): IOpenFacAction {
        //let a = typeof(IOpenFacAction);
        let action: IOpenFacAction;
        action = this.actionList.get(actionName);
        if(!action){
            let action = OpenFacActionFactory.Create(actionName);
            if(action){
                this.Add(actionName, action);
            }
        } 
        return action;
   
    }
}
