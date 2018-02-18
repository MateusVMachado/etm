import { Component, OnInit} from '@angular/core';

import { OpenFacSensorFactory } from '../../../../node_modules/openfac/OpenFac.SensorFactory';
import { OpenFacActionFactory } from '../../../../node_modules/openfac/OpenFac.ActionFactory';
import { OpenFacKeyboardFactory } from '../../../../node_modules/openfac/OpenFac.KeyboardFactory';

import { IOpenFacSensor } from '../../../../node_modules/openfac/OpenFac.Sensor.Interface';
import { IOpenFacAction } from '../../../../node_modules/openfac/OpenFac.Action.Interface';
import { IOpenFacKeyboard } from '../../../../node_modules/openfac/OpenFac.Keyboard.Interface';
import { IOpenFacConfig } from '../../../../node_modules/openfac/OpenFac.Config.Interface';
import { IOpenFacEngine } from '../../../../node_modules/openfac/OpenFac.Engine.Interface';

import { OpenFacActionTTS } from '../../../../node_modules/openfac/OpenFac.ActionTTS';
import { OpenFacActionKeyboardWriter } from '../../../../node_modules/openfac/OpenFac.ActionKeyboardWriter';

//import { OpenFacSensorMicrophone } from '../../../../node_modules/openfac/OpenFac.SensorMicrophone';
import { OpenFacSensorJoystick } from '../../../../node_modules/openfac/OpenFac.SensorJoystick';
import { OpenFacKeyboardQWERT } from '../../../../node_modules/openfac/OpenFac.KeyboardQWERT';

import { OpenFacConfig } from '../../../../node_modules/openfac/OpenFac.Config';

import { OpenFacEngine, EngineState } from '../../../../node_modules/openfac/OpenFac.Engine';

import { ActiveLineCol } from './activeLine.model';
import { TeclaComponent } from '../teclado/tecla/tecla.component';
import { TeclaModel } from '../teclado/tecla/tecla.model';

export class OpenFacComponent implements OnInit {

    public config: IOpenFacConfig;
    public engine: OpenFacEngine;
    public timer: boolean;

    public colorLine: boolean;

    constructor(public activeLine: ActiveLineCol, public teclado: TeclaModel) {   
        this.configureAll();
    }

    ngOnInit() {  

    }

    private ChangeButtonColor(engine:OpenFacEngine, button:number, cor:string): void {
        this.activeLine.col = button;
        this.activeLine.type = 'col';
        this.activeLine.cor = cor;
    }

    private ChangeLineColor(engine:OpenFacEngine, line:number, cor:string): void {
        this.activeLine.line = line;
        this.activeLine.col = 0;
        this.activeLine.type = 'linha';
        this.activeLine.cor = cor;
    }

    public DoLineUp(engine: OpenFacEngine): void  {
        this.ChangeLineColor(engine, engine.GetPriorRowNumber(), 'white');
        this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'yellow');
    }

    public DoLineDown(engine:OpenFacEngine): void {
        this.ChangeLineColor(engine, engine.GetPriorRowNumber(), 'white');
        this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'yellow');
    }
    public DoColumnRight(engine:OpenFacEngine): void {
        this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
        this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'red');
    }
    public DoColumnLeft(engine:OpenFacEngine): void {
        this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
        this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'red');
    }
    public DoAction(engine:OpenFacEngine): void  {
        this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
        this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'yellow');
    }


    public DoCallBack(engine:OpenFacEngine): boolean {
        switch (engine.CurrentState()) {
            case EngineState.LineUp:
                this.DoLineUp(engine);
                break;
            case EngineState.LineDown:
                this.DoLineDown(engine);
                break;
            case EngineState.ColumnLeft:
                this.DoColumnLeft(engine);
                break;
            case EngineState.ColumnRight:
                this.DoColumnRight(engine);
                break;
            case EngineState.DoAction:
                this.DoAction(engine);
                break;
            default:
                break;
        }
        return false;
    }


    public configureAll(){
        OpenFacActionFactory.Register('TTS', OpenFacActionTTS);
        OpenFacActionFactory.Register('Keyboard', OpenFacActionKeyboardWriter);
        //OpenFacSensorFactory.Register('Microphone', OpenFacSensorMicrophone);
        OpenFacSensorFactory.Register('Joystick', OpenFacSensorJoystick);
        OpenFacKeyboardFactory.Register('QWERT', OpenFacKeyboardQWERT);
        // CARREGAR CONFIGURAÇÕES DOS DADOS DO BACKEND ARMAZENADOS LOCALMENTE
        let configFile = {
            KeyboardLayout: "QWERT",
            scanType: "Auto",
            sensor: "Joystick"
        };

        //this.config = new OpenFacConfig(JSON.stringify(configFile));
        this.config = new OpenFacConfig('config.file', this.teclado); // REVER ISSO DEPOIS!!!
        this.engine = new OpenFacEngine(this.config);
        this.engine.DoCallBack(this.DoCallBack.bind(this)); 
        this.engine.Start();

        //BuildLayout
        this.timer = true;
        setInterval(this.timer1_Tick.bind(this), 1500);      
    }
    
    private timer1_Tick(): void {
        if(this.engine !== null) {
            if (this.engine.CurrentState() == EngineState.LineDown) {
                this.engine.CalculateNextLine();
            }
            else if (this.engine.CurrentState() == EngineState.ColumnRight){
                this.engine.CalculateNextButton();
            }    
        }
    }

}
