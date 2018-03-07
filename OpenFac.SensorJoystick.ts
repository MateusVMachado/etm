import { IOpenFacSensor } from './OpenFac.Sensor.Interface';
import { OpenFacSensorBase } from './OpenFac.SensorBase';

export class OpenFacSensorJoystick extends OpenFacSensorBase {

    private toDoAction: boolean = true;
    private cancelationToken: number;
    private gamepads: Gamepad[];
    private keyPressed: String;
    private controllerName: String;
    private worker;
  
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
         //let speed = 1250;
         //let speed = 2000;
         let speed = 1200;
         //setTimeout(this.animate.bind(this), 1000/fps);
         //setTimeout(this.animate.bind(this), 2500/fps);
         //setTimeout(this.animate.bind(this), speed/fps);   
         //this.detectControllers();
         //setTimeout(this.toDoAction = true, (speed/2)/fps );     
         this.cancelationToken = requestAnimationFrame(this.animate.bind(this));
      }

      public animate(){
              //this.cancelationToken = requestAnimationFrame(this.doGamepadLoop.bind(this));
              this.cancelationToken = requestAnimationFrame(this.animate.bind(this));

              this.detectControllers();
              
              const gamepad = this.gamepads[this.mainGamepad];

              if (gamepad && gamepad.connected) {

                for (let index = 0; index < gamepad.buttons.length; index++) {
                  const button = gamepad.buttons[index];

                  if (((button.value > 0) || (button.pressed))) {
                    
                        this.DoAction(0);
                        //this.toDoAction = false;
                        this.keyPressed = button.pressed + " " + button.value;
                        console.log(this.keyPressed);
                        
                    //this.keyPressed = button.pressed + " " + button.value;
                  }
                }
              }

      }

      public getActiveGamepadId(gamepads: Gamepad[]){
            for (let i = 0; i < gamepads.length; i++) {
              if (gamepads[i] === null) break;
              this.gamepads[i].buttons.forEach((key) => {
                if (key.pressed) {
                  this.mainGamepad = i;
                }
              });
            }
      }  

}



// FUNCIONANDO
/*
public doGamepadLoop() {
  let fps = 5;
  let speed = 1200;
  setTimeout(this.animate.bind(this), speed/fps);   
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
                 //this.toDoAction = false;
                 this.keyPressed = button.pressed + " " + button.value;
                 console.log(this.keyPressed);
                 
             //this.keyPressed = button.pressed + " " + button.value;
           }
         }
       }

}
*/