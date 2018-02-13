//import { Activator } from './Activator';
export class OpenFacActionFactory {

    public static Create<T>(type: string): T {
        //let result = typeof(T);
        let instance : T = null;
        let currentStepOnPath : Object|Function = (window || this);
        instance = <T> new (Function.prototype.bind.apply(currentStepOnPath, arguments) )
        return instance;
    }
}