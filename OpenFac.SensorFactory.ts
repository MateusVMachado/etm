import { IOpenFacSensor } from './OpenFac.Sensor.Interface';

export class OpenFacRegisterHelper {
    public type: any;
    public args: any;
}

export class OpenFacSensorFactory {

    public static dicTypes: Map<string, OpenFacRegisterHelper> = new Map<string, OpenFacRegisterHelper>();
    
    public static Create<T extends IOpenFacSensor>(sensorName: string, args?: any): IOpenFacSensor {
        //primeiro faz o get no dic 
        let result = this.dicTypes.get(sensorName); 
        if( result ){
            return new result.type(result.args);
        } else {
            throw new console.error("No type registered for this id");
            
        }    
    }

    public static Register<T extends IOpenFacSensor>(sensorName: string,
                                                     type: { new(any?:any): T ;},
                                                     args?: any): void {
        let helper = new OpenFacRegisterHelper();
        helper.type = type;
        helper.args = args;                                                        
    
        OpenFacSensorFactory.dicTypes.set(sensorName, helper);                                                        
        //OpenFacSensorFactory.dicTypes.set(sensorName, type);
    }

   
}