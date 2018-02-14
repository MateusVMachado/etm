import { IOpenFacAction } from './OpenFac.Action.Interface';
export class OpenFacActionFactory {

    public static dicTypes: Map<string, any> = new Map<string, any>();
    
    public static Create<T extends IOpenFacAction>(actionName: string, type: { new(args?: any): T ;}, args: any): IOpenFacAction {
        //primeiro faz o get no dic 
        //let abc = typeof(type);
        if(this.dicTypes.get(actionName) ){
            return new type(args);
        } else {
            throw new console.error("No type registered for this id");
            
        }    
    }

    public static Register<T extends IOpenFacAction>(actionName: string, type: { new(args?: any): T ;}): IOpenFacAction {
        OpenFacActionFactory.dicTypes.set(actionName, type);
        return
    }

   
}


