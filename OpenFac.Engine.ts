import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { EngineScanType, IOpenFacConfig } from './OpenFac.Config.Interface';
import { SensorState, IOpenFacSensor } from './OpenFac.Sensor.Interface';
import { OpenFacKeyboard } from './OpenFac.Keyboard';
import { OpenFacKeyboardLine } from './OpenFac.KeyboardLine';
import { IOpenFacKeyboard } from './OpenFac.Keyboard.Interface';
import { OpenFacKeyboardButton } from './OpenFac.Button';

export enum EngineState {
    LineDown,
    ColumnRight,
    DoAction,
    LineUp,
    ColumnLeft
};

export interface CallBackEngine {
    (engine: OpenFacEngine): Boolean
}

export class OpenFacEngine implements IOpenFacEngine {

    private func: CallBackEngine;
    private scanType: EngineScanType;
    private currentState: EngineState;
    private keyboardEngine: IOpenFacKeyboard;
    private currentKeyboard: OpenFacKeyboard;
    private currentLine: OpenFacKeyboardLine;
    private OpenFacConfig: IOpenFacConfig;
    private sensorManager: OpenFacSensorManager;

    private currentRowNumber: number;
    private priorRowNumber: number;
    private currentColumnNumber: number;
    private priorColumnNumber: number;


    public DoCallBack(func: CallBackEngine): void {
        this.func = func;
    };

    public DoNextAction(): void {
        switch (this.currentState) {
            case EngineState.LineDown:
                this.currentState = EngineState.ColumnRight;
                break;
            case EngineState.ColumnRight:
                this.currentState = EngineState.DoAction;
                this.DoAction();
                this.currentState = EngineState.LineDown;
                this.ResetColumn();
                break;
            default:
                break;
        }
    };

    public CallSensorAction(sensor: SensorState): void {
        if (this.scanType == EngineScanType.ScanAuto) {
            this.DoNextAction();
        }
    };

    public InvokeCallBack(): void {
        if(this.func){
            this.func(this);
        }
    };

    public CurrentState(): EngineState {
        return this.currentState;
    };

    public SetCurrentState(state: EngineState): void {
        this.currentState = state;
    };

    public CurrentKeyboard(): OpenFacKeyboard {
        return this.currentKeyboard;
    };

    public GetCurrentRowNumber(): Number {
        return this.currentRowNumber;        
    };

    public GetPriorRowNumber(): Number {
        return this.priorRowNumber;
    };

    public GetCurrentColumnNumber(): Number {
        return this.currentColumnNumber;
    };

    public GetPriorColumnNumber(): Number {
        return this.priorColumnNumber;
    };

    public CalculateNextButton(): void {
        this.priorColumnNumber = this.currentColumnNumber;
        this.currentColumnNumber = + 1;
        if (this.currentColumnNumber == this.currentLine.Buttons.Count()) {
            this.currentColumnNumber = 0;
        }
        this.InvokeCallBack();
    };

    public CalculateNextLine(): void {
        this.priorRowNumber = this.currentRowNumber;
        this.currentRowNumber = + 1;
        if (this.currentRowNumber == this.currentKeyboard.Lines.Count()) {
            this.currentRowNumber = 0;
        }
        this.currentLine = this.currentKeyboard.Lines.Items[this.currentRowNumber];
        this.InvokeCallBack();
    };

    public CalculatePriorButton(): void {
        this.priorColumnNumber = this.currentColumnNumber;
        this.currentColumnNumber = - 1;
        if (this.currentColumnNumber < 0) {
            this.currentColumnNumber = (this.currentLine.Buttons.Count() - 1);
        }
        this.InvokeCallBack();
    };

    public CalculatePriorLine(): void {
        this.priorRowNumber = this.currentRowNumber;
        this.currentRowNumber = - 1;
        if (this.currentRowNumber < 0) {
            this.currentRowNumber = this.currentKeyboard.Lines.Count() - 1;
        }
        this.currentLine = this.currentKeyboard.Lines.Items[this.currentRowNumber];
        this.InvokeCallBack();
    };

    public DoAction(): void {
        let bt = this.GetCurrentButton();
        if (this.keyboardEngine) {
            this.keyboardEngine.DoAction(bt);
        }
        if (bt) {
            bt.Action ? bt.Action.Execute(this) : this.InvokeCallBack();
        }
   };

    public SensorDoAction(state: SensorState): void {
        if (this.scanType == EngineScanType.ScanAuto){
            this.DoNextAction();
        }
    };

    public ResetColumn(): void {
        this.currentColumnNumber = 0;
    };

    public GetCurrentButton(): OpenFacKeyboardButton {
        return this.currentKeyboard.Lines.Items[this.currentRowNumber].Buttons.Items[this.currentColumnNumber] as OpenFacKeyboardButton;
    };
    
    public CurrentLine(): OpenFacKeyboardLine {
        return this.currentLine;
    };

    public Start(): void {
        this.OpenFacConfig.GetScanType() == EngineScanType.ScanAuto ? this.scanType = EngineScanType.ScanAuto : this.scanType = EngineScanType.ScanManual;
    
        this.currentKeyboard = this.OpenFacConfig.GetCurrentKeyboard();
        
        s = this.sensorManager.Find(this.OpenFacConfig.GetActiveSensor());
        s.DoCallBack(this, CallSensorAction);
        if (s != null)
        {
            s.Start();
        }
    };
}