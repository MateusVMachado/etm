import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { EngineScanType, IOpenFacConfig } from './OpenFac.Config.Interface';
import { SensorState, IOpenFacSensor } from './OpenFac.Sensor.Interface';
import { OpenFacKeyboard } from './OpenFac.Keyboard';
import { OpenFacKeyboardLine } from './OpenFac.KeyboardLine';
import { IOpenFacKeyboard } from './OpenFac.Keyboard.Interface';
import { OpenFacKeyboardButton } from './OpenFac.KeyboardButton';
import { OpenFacSensorManager } from './OpenFac.SensorManager';
import { OpenFacKeyboardManager } from './OpenFac.KeyboardManager';


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

    private activeSensor: IOpenFacSensor;
    private currentState: EngineState;
    private currentKeyboard: OpenFacKeyboard;
    private keyboardManager: OpenFacKeyboardManager;
    private keyboardEngine: IOpenFacKeyboard;
    private openFacConfig: IOpenFacConfig;
    private func: CallBackEngine;
    private currentLine: OpenFacKeyboardLine;
    private sensorManager: OpenFacSensorManager = new OpenFacSensorManager();
    private scanType: EngineScanType;
    private currentRowNumber: number;
    private priorRowNumber: number;
    private currentColumnNumber: number;
    private priorColumnNumber: number;

    constructor(config: IOpenFacConfig){
        this.openFacConfig = config;
        this.currentState = EngineState.LineDown;
        this.currentRowNumber = this.priorRowNumber = 0;
        this.currentColumnNumber = this.priorColumnNumber = -1;
        this.keyboardManager = this.openFacConfig.GetKeyboardManager();
    }


    public DoCallBack(func: CallBackEngine): void {
        this.func = func;
    };


    public CallSensorAction(sensor: SensorState): void {
        this.SensorDoAction(sensor);
    }


    public InvokeCallBack(): void {
        if ( this.func !== null ){
            this.func(this);
        }
    }


    public CurrentState(): EngineState {
        return this.currentState;
    };

    public SetCurrentState(state: EngineState): void {
        this.currentState = state;
    };


    public CurrentKeyboard(): OpenFacKeyboard {
        return this.currentKeyboard;
    };

    public GetCurrentRowNumber(): number {
        return this.currentRowNumber;        
    };

    
    public GetPriorRowNumber(): number {
        return this.priorRowNumber;
    };

    public GetCurrentColumnNumber(): number {
        return this.currentColumnNumber;
    };

    public GetPriorColumnNumber(): number {
        return this.priorColumnNumber;
    };

    public CalculateNextButton(): void {
        if( this.currentRowNumber === 0) this.currentLine = this.currentKeyboard.Lines.Items[this.currentRowNumber];
        this.priorColumnNumber = this.currentColumnNumber;
        this.currentColumnNumber = this.currentColumnNumber + 1;
        if (this.currentColumnNumber == this.currentLine.Buttons.Count()) {
            this.currentColumnNumber = 0;
        }
        this.InvokeCallBack();
    };

    public CalculateNextLine(): void {
        this.priorRowNumber = this.currentRowNumber;
        this.currentRowNumber = this.currentRowNumber + 1;
        if (this.currentRowNumber == this.currentKeyboard.Lines.Count()) {
            this.currentRowNumber = 0;
        }
        this.currentLine = this.currentKeyboard.Lines.Items[this.currentRowNumber];
        this.InvokeCallBack();
    };

    public CalculatePriorButton(): void {
        if( this.currentRowNumber === 0) this.currentLine = this.currentKeyboard.Lines.Items[this.currentRowNumber];
        this.priorColumnNumber = this.currentColumnNumber;
        this.currentColumnNumber = this.currentColumnNumber - 1;
        if (this.currentColumnNumber < 0) {
            this.currentColumnNumber = (this.currentLine.Buttons.Count() - 1);
        }
        this.InvokeCallBack();
    };

    public CalculatePriorLine(): void {
        this.priorRowNumber = this.currentRowNumber;
        this.currentRowNumber = this.currentRowNumber - 1;
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


    public ResetColumn(): void {
        this.currentColumnNumber = -1;
    };

    public GetCurrentButton(): OpenFacKeyboardButton {
        return this.currentKeyboard.Lines.Items[this.currentRowNumber]
                    .Buttons.Items[this.currentColumnNumber] as OpenFacKeyboardButton;
    };
    
    public CurrentLine(): OpenFacKeyboardLine {
        return this.currentLine;
    };


    public Stop(): void {
        this.activeSensor.Stop();         
    }

    public Start(): void {
        this.openFacConfig.GetScanType() == EngineScanType.ScanAuto ? 
                    this.scanType = EngineScanType.ScanAuto : this.scanType = EngineScanType.ScanManual;
    
        
        this.currentKeyboard = this.openFacConfig.GetCurrentKeyboard();
        
        this.activeSensor = this.sensorManager.Find(this.openFacConfig.GetActiveSensor());
        this.activeSensor.DoCallBack(this, this.CallSensorAction.bind(this));
        if (this.activeSensor != null)
        {
                this.activeSensor.Start();           
        }
    };
}