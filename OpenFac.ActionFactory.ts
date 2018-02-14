import { IOpenFacAction } from './OpenFac.Action.Interface';
export class OpenFacActionFactory {

    public static dicTypes: Map<string, any> = new Map<string, any>();
    
    public static Create(actionName: string, args?: any): IOpenFacAction {
        //primeiro faz o get no dic 
        let result = this.dicTypes.get(actionName)
        if( result ){
            return new result(args);
        } else {
            throw new console.error("No type registered for this id");
            
        }    
    }

    public static Register<T extends IOpenFacAction>(actionName: string, type: { new(args?: any): T ;}) {
        OpenFacActionFactory.dicTypes.set(actionName, type);
    }

   
}


