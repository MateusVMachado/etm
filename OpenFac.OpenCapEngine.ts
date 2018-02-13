import { IOpenCapEngine } from './OpenFac.OpenCapEngine.Interface';
import { EngineScanType, IOpenCapConfig } from './OpenFac.OpenCapConfig.Interface';
import { SensorState, IOpenCapSensor } from './OpenFac.OpenCapSensor.Interface';
import { OpenCapKeyboard } from './OpenFac.OpenCapKeyboard';
import { OpenCapKeyboardLine } from './OpenFac.OpenCapKeyboardLine';
import { IOpenCapKeyboard } from './OpenFac.OpenCapKeyboard.Interface';
import { OpenCapKeyboardButton } from './OpenFac.OpenCapButton';

export enum EngineState {
    LineDown,
    ColumnRight,
    DoAction,
    LineUp,
    ColumnLeft
};

export interface CallBackEngine {
    (engine: OpenCapEngine): Boolean
}

export class OpenCapEngine implements IOpenCapEngine {

    private func: CallBackEngine;
    private scanType: EngineScanType;
    private currentState: EngineState;
    private keyboardEngine: IOpenCapKeyboard;
    private currentKeyboard: OpenCapKeyboard;
    private currentLine: OpenCapKeyboardLine;
    private openCapConfig: IOpenCapConfig;
    private sensorManager: OpenCapSensorManager;

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

    public CurrentKeyboard(): OpenCapKeyboard {
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

    public GetCurrentButton(): OpenCapKeyboardButton {
        return this.currentKeyboard.Lines.Items[this.currentRowNumber].Buttons.Items[this.currentColumnNumber] as OpenCapKeyboardButton;
    };
    
    public CurrentLine(): OpenCapKeyboardLine {
        return this.currentLine;
    };

    public Start(): void {
        this.openCapConfig.GetScanType() == EngineScanType.ScanAuto ? this.scanType = EngineScanType.ScanAuto : this.scanType = EngineScanType.ScanManual;
    
        this.currentKeyboard = this.openCapConfig.GetCurrentKeyboard();
        
        s = this.sensorManager.Find(this.openCapConfig.GetActiveSensor());
        s.DoCallBack(this, CallSensorAction);
        if (s != null)
        {
            s.Start();
        }
    };
}