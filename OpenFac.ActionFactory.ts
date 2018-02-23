import { IOpenFacAction } from './OpenFac.Action.Interface';
export class OpenFacActionFactory {

    public static dicTypes: Map<string, any> = new Map<string, any>();
    public static dicInsta: Map<string, any> = new Map<string, any>();
    public static dicService: Map<string, any> = new Map<string, any>();
    public static dicZone: Map<string, any> = new Map<string, any>();
    
    public static Create(actionName: string): IOpenFacAction {
        //primeiro faz o get no dic 
        let result = this.dicTypes.get(actionName)
        if( result ){
            let args = this.dicInsta.get(actionName)
            let service = this.dicService.get(actionName);
            let zone = this.dicZone.get(actionName);
            return new result(args, service, zone);
        } else {
            throw new console.error("No type registered for this id");
            
        }    
    }

    public static Register<T extends IOpenFacAction>(actionName: string, 
                                                    type: { new(args?:any, service?:any, zone?: any): T ;}, 
                                                    args?: any, service?:any, zone?:any) {                                              
        OpenFacActionFactory.dicTypes.set(actionName, type);
        OpenFacActionFactory.dicInsta.set(actionName, args);
        OpenFacActionFactory.dicService.set(actionName, service);
        OpenFacActionFactory.dicZone.set(actionName, zone);
    }

   
}


