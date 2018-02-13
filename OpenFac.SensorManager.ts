import { IOpenFacSensor } from "./OpenFac.Sensor.Interface";

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
            sensor = null;
            if(sensor){
                this.Add(sensorName, sensor);
            }
        } 
        return sensor;
    };

};