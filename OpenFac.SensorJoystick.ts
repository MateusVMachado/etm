import { IOpenFacSensor } from './OpenFac.Sensor.Interface';
import { OpenFacSensorBase } from './OpenFac.SensorBase';

export class OpenFacSensorJoystick extends OpenFacSensorBase {

    private cancelationToken: number;
    private gamepads: Gamepad[];
    private gamepad: any;
    public keyPressed: String;
    public controllerName: String;
  
    public main_gamepad: number = 3;
  
    private lastPressedButton: Number;

    constructor(document: any) {
        super();
        this.lastPressedButton = -1;
    }

    public Dispose(): void {      
      this.Stop();
    }
    
    public IsTrigged(): boolean {
        return false;
    }

    public Start(): void {
      this.doGamepadLoop();      
    }

    public Stop(): void{
      cancelAnimationFrame(this.cancelationToken);
    }

    public static Create(documentDOM: any): IOpenFacSensor {
        return new OpenFacSensorJoystick(documentDOM);
    }

    public detectControllers(){
        this.gamepads = navigator.getGamepads();
        if (this.gamepads) {
          if (this.gamepads[this.main_gamepad]) {
            this.controllerName = this.gamepads[this.main_gamepad].id;
          }
        }
      }
    
      public stopListenningKeys() {
        console.log('Processo terminado.');
        window.cancelAnimationFrame(this.cancelationToken);
      }
    
    
      public doGamepadLoop() {
         let fps = 5;
         setTimeout(this.animate.bind(this), 1000/fps);
                  

      }

      public animate(){
              this.cancelationToken = requestAnimationFrame(this.doGamepadLoop.bind(this));

              this.detectControllers();
              const gamepad = this.gamepads[this.main_gamepad];
              if (gamepad && gamepad.connected) {

                for (let index = 0; index < gamepad.buttons.length; index++) {
                  const button = gamepad.buttons[index];

                  if (((button.value > 0) || (button.pressed))) {
                    this.DoAction(0);
                    console.log("botão " + index + ': ' + button.value);
                    this.keyPressed = button.pressed + " " + button.value;
                  }
                }
              }

      }

}

