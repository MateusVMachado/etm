import { IOpenFacSensor } from './OpenFac.Sensor.Interface';
import { OpenFacSensorBase } from './OpenFac.SensorBase';

export class OpenFacSensorJoystick extends OpenFacSensorBase {

    private cancelationToken: number;
    private gamepads: Gamepad[];
    private keyPressed: String;
    private controllerName: String;
  
    //public main_gamepad: number = 1;
    private mainGamepad: number = -1;

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
        
        if(this.mainGamepad === -1){
            this.getActiveGamepadId(this.gamepads);
        }    
        if (this.gamepads) {
          if (this.gamepads[this.mainGamepad]) {
            this.controllerName = this.gamepads[this.mainGamepad].id;
          }
        }
      }
    
      public stopListenningKeys() {
        window.cancelAnimationFrame(this.cancelationToken);
      }
    
    
      public doGamepadLoop() {
         let fps = 5;
         //setTimeout(this.animate.bind(this), 1000/fps);
         setTimeout(this.animate.bind(this), 2500/fps);
                  

      }

      public animate(){
              this.cancelationToken = requestAnimationFrame(this.doGamepadLoop.bind(this));

              this.detectControllers();
              const gamepad = this.gamepads[this.mainGamepad];
              if (gamepad && gamepad.connected) {

                for (let index = 0; index < gamepad.buttons.length; index++) {
                  const button = gamepad.buttons[index];

                  if (((button.value > 0) || (button.pressed))) {
                    this.DoAction(0);
                    this.keyPressed = button.pressed + " " + button.value;
                  }
                }
              }

      }

      public getActiveGamepadId(gamepads: Gamepad[]){
        if(gamepads.length === 0 ) return;
        for(let i=0 ; i < gamepads.length; i++){
            this.gamepads[i].buttons.forEach((key) =>{
              if(key.pressed){
                this.mainGamepad = i;
              }  
            });
        }
        
      }  

}

