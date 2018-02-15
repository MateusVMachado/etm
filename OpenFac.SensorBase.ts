import { IOpenFacSensor, CallBackSensor, SensorState } from './OpenFac.Sensor.Interface';

export abstract class OpenFacSensorBase  implements IOpenFacSensor {

    private func: CallBackSensor;
    private pObject: Object ;
    
    constructor () {

    }
    public abstract Dispose (): void;

    public abstract Start (): void;

    public abstract Stop (): void;

    public DoCallBack (pFunc: Object, callback: CallBackSensor): void {
        this.func = callback;
        this.pObject = pFunc;
    }
    
    public  DoAction (state: SensorState): void {
        if(this.func != null) {
            this.func(SensorState.SensorAuto);
        }
    } 
}