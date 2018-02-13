import { IOpenFacSensor, CallBackSensor, SensorState } from './OpenFac.Sensor.Interface';

export class OpenFacSensorBase  implements IOpenFacSensor {

    private func: CallBackSensor;
    private pObject: Object ;
    
    constructor () {

    }
    public Dispose (): void {

    }
    public  Start (): void {

    }
    public  Stop (): void { 

    }
    public DoCallBack (pFunc: Object, sensor: CallBackSensor): void {
        this.func = sensor;
        this.pObject = pFunc;
    }
    public  DoAction (state: SensorState): void {
        if(this.func != null) {
            this.func(SensorState.SensorAuto);
        }
    } 
}