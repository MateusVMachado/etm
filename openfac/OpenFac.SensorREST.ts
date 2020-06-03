import { OpenFacSensorBase } from './OpenFac.SensorBase';
import { IOpenFacSensor } from './OpenFac.Sensor.Interface';

export class OpenFacSensorRESTWindows extends OpenFacSensorBase {
    private isTrigged: boolean;
    constructor() {
        super();
    }
    public Dispose(): void {
        super.Dispose();
    }
    public IsTrigged(): boolean {
        return this.isTrigged;
    }
    public static Create(): IOpenFacSensor {
        return new OpenFacSensorRESTWindows();
    }
}