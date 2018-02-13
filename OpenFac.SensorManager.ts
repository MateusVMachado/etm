import { IOpenCapSensor } from "./OpenFac.Sensor.Interface";

export class OpenCapSensorManager {

    private sensorList: Map<string, IOpenCapSensor> = new  Map<string, IOpenCapSensor>();

    public Add(sensorName: string, sensor: IOpenCapSensor){
        this.sensorList.set(sensorName, sensor);        
    }

    public List(): Map<string, IOpenCapSensor>{
        return this.sensorList;
    };

    public Find(sensorName: string): IOpenCapSensor {
        let sensor: IOpenCapSensor;
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