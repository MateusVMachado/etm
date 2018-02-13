import { IOpenFacSensor } from './OpenFac.Sensor.Interface';
import { OpenFacSensorBase } from './OpenFac.SensorBase';

export class OpenFacSensorJoystick extends OpenFacSensorBase {
    constructor() {
        super();
    }
    public Dispose(): void {
        super.Dispose();
    }
    public IsTrigged(): boolean {
        return false;
    }
    public static Create(): IOpenFacSensor {
        return new OpenFacSensorJoystick();
    }
}