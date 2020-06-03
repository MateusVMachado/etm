import { IOpenFacSensor } from "./OpenFac.Sensor.Interface";
import { OpenFacSensorFactory } from './OpenFac.SensorFactory';

export class OpenFacSensorManager {
    private sensorList: Map<string, IOpenFacSensor> = new  Map<string, IOpenFacSensor>();
    public Add(sensorName: string, sensor: IOpenFacSensor){
        this.sensorList.set(sensorName, sensor);        
    }
    public List(): Map<string, IOpenFacSensor>{
        return this.sensorList;
    };
    public Find(sensorName: string): IOpenFacSensor {
        let sensor: IOpenFacSensor;
        sensor = this.sensorList.get(sensorName);
        if(!sensor){
            sensor = OpenFacSensorFactory.Create(sensorName);
            if(sensor){
                this.Add(sensorName, sensor);
            }
        } 
        return sensor;
    };

};