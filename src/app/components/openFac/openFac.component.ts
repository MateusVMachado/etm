import { Component, OnInit } from '@angular/core';

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

import { OpenFacSensorMicrophone } from '../../../../node_modules/openfac/OpenFac.SensorMicrophone';
import { OpenFacSensorJoystick } from '../../../../node_modules/openfac/OpenFac.SensorJoystick';
import { OpenFacKeyboardQWERT } from '../../../../node_modules/openfac/OpenFac.KeyboardQWERT';

import { OpenFacConfig } from '../../../../node_modules/openfac/OpenFac.Config';

import { OpenFacEngine, EngineState } from '../../../../node_modules/openfac/OpenFac.Engine';

export class OpenFacComponent implements OnInit {

    public config: IOpenFacConfig;
    public engine: IOpenFacEngine;
    public timer: boolean;

    public colorLine: boolean;

    constructor() {   
        console.log("MARK3"); 
        this.configureAll();
    }

    ngOnInit() {  
        console.log("MARK2");
        this.configureAll();
    }

    private ChangeButtonColor(engine:OpenFacEngine, button:number, cor:string): void {
        /*
        if(tableLayoutPanel.RowCount > 0) {
            var ct: Control = tableLayoutPanel.GetControlFromPosition(button, engine.GetCurrentRowNumber());
            if (ct != null) {
                var bt: Button = __as__<Button>(ct, Button);
                bt.BackColor = cor;
            }
        }
        */
    }

    private ChangeLineColor(engine:OpenFacEngine, line:number, cor:string): void {
        console.log(line);
        /*
        if(tableLayoutPanel.RowCount > 0)
            for(var i:number = 0;i<engine.CurrentKeyboard().Lines.Items[line].Buttons.Count();i++)
                {
                var ct: Control = tableLayoutPanel.GetControlFromPosition(i, line);
               if (ct != null) {
                    var bt: Button = __as__<Button>(ct, Button);
                    bt.BackColor = cor;
                }
        }
        */
    }

    private DoLineUp(engine: OpenFacEngine): void  {
        //this.ChangeLineColor(engine, engine.GetPriorRowNumber(), 'white');
        this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'yellow');
    }

    private DoLineDown(engine:OpenFacEngine): void {
        //this.ChangeLineColor(engine, engine.GetPriorRowNumber(), 'white');
        this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'yellow');
    }
    private DoColumnRight(engine:OpenFacEngine): void {
        //this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
        this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'yellow');
    }
    private DoColumnLeft(engine:OpenFacEngine): void {
        //this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
        this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'yellow');
    }
    private DoAction(engine:OpenFacEngine): void  {
        //this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
        this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'yellow');
    }


    public DoCallBack(engine:OpenFacEngine): boolean {
    switch ((this.engine as OpenFacEngine).CurrentState()) {
        case EngineState.LineUp:
            this.DoLineUp((this.engine as OpenFacEngine));
            break;
        case EngineState.LineDown:
            this.DoLineDown((this.engine as OpenFacEngine));
            break;
        case EngineState.ColumnLeft:
            this.DoColumnLeft((this.engine as OpenFacEngine));
            break;
        case EngineState.ColumnRight:
            this.DoColumnRight((this.engine as OpenFacEngine));
            break;
        case EngineState.DoAction:
            this.DoAction((this.engine as OpenFacEngine));
            break;
        default:
            break;
    }
    return false;
}


    public configureAll(){
        OpenFacActionFactory.Register('TTS', OpenFacActionTTS);
        OpenFacActionFactory.Register('Keyboard', OpenFacActionKeyboardWriter);
        OpenFacSensorFactory.Register('Microphone', OpenFacSensorMicrophone);
        OpenFacSensorFactory.Register('Joystick', OpenFacSensorJoystick);
        OpenFacKeyboardFactory.Register('QWERT', OpenFacKeyboardQWERT);
        // CARREGAR CONFIGURAÇÕES DOS DADOS DO BACKEND ARMAZENADOS LOCALMENTE
        let configFile = {
            scanType: "Auto",
            sensor: "Joystick"
        };

        this.config = new OpenFacConfig(JSON.stringify(configFile));
        this.engine = new OpenFacEngine(this.config);
        (this.engine as OpenFacEngine).DoCallBack(this.DoCallBack); 
        this.engine.Start();

        //BuildLayout
        this.timer = true;
        setTimeout(this.timer1_Tick(), 3000);      
    }

    //private timer1_Tick(sender:Object, e:EventArgs): void
    private timer1_Tick(): void {
        console.log("Tick");
        if(this.engine != null) {
            if ((this.engine as OpenFacEngine).CurrentState() == EngineState.LineDown)
                (this.engine as OpenFacEngine).CalculateNextLine();

            else if ((this.engine as OpenFacEngine).CurrentState() == EngineState.ColumnRight)
                (this.engine as OpenFacEngine).CalculateNextButton();
        }
    }

}
