export enum SensorState {
    SensorDown,
    SensorUp,
    SensorRight,
    SensorLeft,
    SensorAuto
}
export interface CallBackSensor{
    (state: SensorState): void
};

export interface IOpenFacSensor {
    DoCallBack(func: Object, callback: CallBackSensor): void;
    DoAction(state: SensorState): void;
    Start(): void;
    Stop(): void;
}