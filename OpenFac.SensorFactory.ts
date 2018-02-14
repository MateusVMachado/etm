import { IOpenFacSensor } from './OpenFac.Sensor.Interface';
export class OpenFacSensorFactory {

    public static dicTypes: Map<string, any> = new Map<string, any>();
    
    public static Create<T extends IOpenFacSensor>(sensorName: string, type: { new(): T ;}): IOpenFacSensor {
        //primeiro faz o get no dic 
        //let abc = typeof(type);
        if(this.dicTypes.get(sensorName) ){
            return new type();
        } else {
            throw new console.error("No type registered for this id");
            
        }    
    }

    public static Register<T extends IOpenFacSensor>(actionName: string, type: { new(): T ;}): IOpenFacSensor {
        OpenFacSensorFactory.dicTypes.set(actionName, type);
        return
    }

   
}