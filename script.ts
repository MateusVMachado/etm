import { OpenFacActionFactory } from './OpenFac.ActionFactory';
import { IOpenFacAction } from './OpenFac.Action.Interface';
import { IOpenFacEngine } from './OpenFac.Engine.Interface';
import { OpenFacEngine } from './OpenFac.Engine';
import { IOpenFacConfig, EngineScanType } from './OpenFac.Config.Interface';

import { OpenFacSensorFactory } from './OpenFac.SensorFactory';
import { IOpenFacSensor, SensorState, CallBackSensor } from './OpenFac.Sensor.Interface';

import { OpenFacKeyboardFactory } from './OpenFac.KeyboardFactory';
import { IOpenFacKeyboard } from './OpenFac.Keyboard.Interface';
import { OpenFacKeyboardButton } from './OpenFac.KeyboardButton';

import { OpenFacKeyboardManager } from './OpenFac.KeyboardManager';
import { OpenFacKeyboard } from './OpenFac.Keyboard';


  ////////////////////////////
 //// CLASSES PARA SENSOR ///
////////////////////////////
export class TSensor implements IOpenFacSensor {
    public DoCallBack(func: Object, sensor: CallBackSensor): void {    };
    public DoAction(state: SensorState): void {
        if ( state === SensorState.SensorAuto){
            console.log("> Instance of Sensor Factory");
          }
    }; 
    public Start(): void {    };
    public Stop(): void {    };
}

  ////////////////////////////
 //// CLASSES PARA ACTION ///
////////////////////////////
export class Action implements IOpenFacAction {
    
    private name: string;

    constructor(name: string){
        this.name = name;
    }

    public Execute(Engine: IOpenFacEngine): void {
        console.log("> Instance of Action Factory");
        console.log('   ' + this.name);
    };
}

export class Config implements IOpenFacConfig {
    public GetKeyboardManager(): OpenFacKeyboardManager {return}
    public GetCurrentKeyboard(): OpenFacKeyboard {return}
    public GetScanType(): EngineScanType {return}
    public GetActiveSensor(): string {return}
}
  //////////////////////////////
 //// CLASSES PARA KEYBOARD ///
//////////////////////////////
export class TKeyboard implements IOpenFacKeyboard {

    constructor(){  
    }

   public DoAction(button: OpenFacKeyboardButton): void {
        console.log("> Instance of Keyboard Factory");
        console.log('   ' + buttons.Items[0].Caption + ' ' + buttons.Items[0].Text);
   };
}


  ////////////////////////////
 //// SCRIPT MAIN SESSION ///
////////////////////////////
console.log("\nStarting script...\n");

//// Action ////
OpenFacActionFactory.Register('action_0', Action);
let actionInstance = OpenFacActionFactory.Create('action_0', 'teste');
let config = new Config();
let engine = new OpenFacEngine(config);
actionInstance.Execute(engine);

//// Sensor ////
OpenFacSensorFactory.Register('sensor_0', TSensor);
let sensorInstance = OpenFacSensorFactory.Create('sensor_0');
sensorInstance.DoAction(SensorState.SensorAuto);

//// Keyboard ////
OpenFacKeyboardFactory.Register('keyboard_0', TKeyboard);
let keyboardInstance = OpenFacKeyboardFactory.Create('keyboard_0');
let buttons = new OpenFacKeyboardButton();
buttons.Add();
buttons.Items[0].Caption = 'superButton';
buttons.Items[0].Text = 'clickMe';
keyboardInstance.DoAction(buttons);


console.log("\nScript terminated.");
