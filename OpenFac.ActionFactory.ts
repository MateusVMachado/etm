import { IOpenFacAction } from './OpenFac.Action.Interface';

export class OpenFacRegisterHelper {
    public type: any;
    public args: any;
}

export class OpenFacActionFactory {

    public static dicTypes: Map<string, OpenFacRegisterHelper> = new Map<string, OpenFacRegisterHelper>();
    
    public static Create(actionName: string): IOpenFacAction {
        //primeiro faz o get no dic 
        let result = this.dicTypes.get(actionName)
        if( result ){
           return new result.type(result.args);
        } else {
            //throw new console.error("No type registered for this id");
            
        }    
    }

    public static Register<T extends IOpenFacAction>(actionName: string, 
                                                    type: { new(args?:any): T ;}, 
                                                    args?: any) {                                              
        let helper = new OpenFacRegisterHelper();
        helper.type = type;
        helper.args = args;                                                        
        OpenFacActionFactory.dicTypes.set(actionName, helper);
    }

   
}


