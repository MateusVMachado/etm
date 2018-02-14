import { IOpenFacSensor } from './OpenFac.Sensor.Interface';
export class OpenFacSensorFactory {

    public static dicTypes: Map<string, any> = new Map<string, any>();
    
    public static Create<T extends IOpenFacSensor>(sensorName: string, args?: any): IOpenFacSensor {
        //primeiro faz o get no dic 
        let result = this.dicTypes.get(sensorName); 
        if( result ){
            return new result(args);
        } else {
            throw new console.error("No type registered for this id");
            
        }    
    }

    public static Register<T extends IOpenFacSensor>(sensorName: string, type: { new(any?:any): T ;}): void {
        OpenFacSensorFactory.dicTypes.set(sensorName, type);
    }

   
}