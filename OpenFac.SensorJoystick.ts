import { IOpenFacSensor } from './OpenFac.Sensor.Interface';
import { OpenFacSensorBase } from './OpenFac.SensorBase';
import { TecladoService } from '../../src/app/components/teclado/teclado.service';

export class Button{

  value: number;
  pressed: boolean;
}

export class EtmGamepad{
  id: string;
  connected: boolean;
  buttons: Array<Button>;

  constructor(){
    this.buttons = new Array<Button>();
  }

}


export class OpenFacSensorJoystick extends OpenFacSensorBase {

    private sentinel: boolean = true;
    private toDoAction: boolean = true;
    private cancelationToken: number;
    private gamepads: Gamepad[];
    private keyPressed: String;
    private controllerName: String;
    private worker: any;
    private tecladoService: any;
  
    //public main_gamepad: number = 1;
    private mainGamepad: number = -1;

    private lastPressedButton: Number;

    constructor(private args: any) {
        super();
        this.tecladoService = this.args[0];
        this.lastPressedButton = -1;
    }

    public Dispose(): void {      
      this.Stop();
    }
    
    public IsTrigged(): boolean {
        return false;
    }

    public Start(): void {

      this.startWorker();
      this.animateLoop();
    
    }

    public sayHello(){
      console.log("helooooo from say helloooo");
    }
    


    public detectControllers(){
      
      this.gamepads = navigator.getGamepads();

      let gamepadsArray = new Array<EtmGamepad>();
      for(let i =0 ; i < this.gamepads.length; i++){
          if(this.gamepads[i] !== null){
            let gamepad = new EtmGamepad();
            gamepad.connected = this.gamepads[i].connected;
            gamepad.id = this.gamepads[i].id;
            gamepadsArray.push(gamepad);
            for (let j = 0; j < this.gamepads[i].buttons.length; j++) {
              let button = this.gamepads[i].buttons[j];
              let etmButton = new Button();
              etmButton.value = button.value;
              etmButton.pressed = button.pressed;
              gamepad.buttons.push(etmButton);
            }
          } 
      }
      
      
      let msg = {
        start: true,
        gamepads: gamepadsArray
      };       

      this.worker.postMessage(msg); // Start the worker.

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


    public animateLoop(){
      this.cancelationToken = requestAnimationFrame(this.animateLoop.bind(this));

      this.detectControllers();
    
    }


    public startWorker() {
      if (typeof (Worker) !== "undefined") {
        if (typeof (this.worker) == "undefined") {
          let workerCode = 'var gamepads;'+
          'var sentinel = 0;'+
          'var sentinelIndex = -1;'+
          'var mainGamepad = -1;'+
          'var controllerName;'+
          'var doLoop = true;'+
          'var navigatorObj = self.navigator;'+
          ''+
          'function getActiveGamepadId(gamepads) {'+
          '        var _loop_1 = function (i) {'+
          '            if (gamepads[i] === null)'+
          '                return "break";'+
          '            gamepads[i].buttons.forEach(function (key) {'+
          '                if (key.pressed) {'+
          '                    mainGamepad = i;'+
          '                }'+
          '            });'+
          '        };'+
          '        for (var i = 0; i < gamepads.length; i++) {'+
          '            var state_1 = _loop_1(i);'+
          '            if (state_1 === "break")'+
          '                break;'+
          '        }'+
          '    };'+
          ''+
          ''+
          'function detectControllers(gamepads) {'+
          '	if (mainGamepad === -1) {'+
          '		getActiveGamepadId(gamepads);'+
          '	}'+
          '	if (gamepads) {'+
          '		if (gamepads[mainGamepad]) {'+
          '			controllerName = gamepads[mainGamepad].id;'+
          '		}'+
          '	}'+
          '};'+
          ''+
          'function animate(gamepads) {        '+
         ' if(!gamepads) return;'+
          '		detectControllers(gamepads);'+
          '		var gamepad = gamepads[mainGamepad];'+
          
          '		if (gamepad && gamepad.connected) {'+
          '			for (var index = 0; index < gamepad.buttons.length; index++) {'+
          '				var button = gamepad.buttons[index];'+
          '				if (((button.value > 0) || (button.pressed))) {'+
          '       sentinelIndex = index;'+
          '       sentinel += 1;'+
          '         if(sentinel < 2){'+
          '					  postMessage("doAction");'+
          '         }'+
          '       }'+
          '				if (!button.pressed && index === sentinelIndex){'+     
          '           sentinel=0;'+
          '       }'+
          '			}'+
          '		}'+
          '};'+
          ''+
          'self.onmessage = function (msg) {'+          
          ' msg = msg.data; '+
          ' gamepads = msg.gamepads; '+
          '  if(msg.start){'+
          '    animate(gamepads);'+
          '  }else{'+
          '    doLoop = false;'+
          '  }'+
          '}'+
          ' ';
          let blob = new Blob([workerCode], { type: "text/javascript" })
        
          // Note: window.webkitURL.createObjectURL() in Chrome 10+.
          this.worker = new Worker(window.URL.createObjectURL(blob));   
          let msg = {
            start: true
          };       
          this.worker.postMessage(msg); // Start the worker.
          this.worker.addEventListener('message', this.executeDoAction.bind(this));
        };
      } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Workers...";
      }
   }

   public executeDoAction(msg){
      this.tecladoService.emitTecladoCommand("pressed");
      this.DoAction(0);
   }

  public stopWorker() { 
    if(this.worker){
      this.worker.postMessage({start: false}); // stop the worker.
      this.worker.terminate();
      this.worker = undefined;
    }    
  }

  public Stop(): void{
    this.stopWorker();
  }

  public static Create(documentDOM: any): IOpenFacSensor {
    return new OpenFacSensorJoystick(documentDOM);
  }
}

