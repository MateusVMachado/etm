import { IOpenFacSensor } from './OpenFac.Sensor.Interface';
import { OpenFacSensorBase } from './OpenFac.SensorBase';

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
      //this.worker = new Worker('worker.js');

      //var w;
      this.startWorker();
      this.animateLoop();

      //this.doGamepadLoop();      
    }

    public sayHello(){
      console.log("helooooo from say helloooo");
    }
    


    public detectControllers(){
      
      this.gamepads = navigator.getGamepads();
    /*  
      if(this.mainGamepad === -1){
          this.getActiveGamepadId(this.gamepads);
      }    
      if (this.gamepads) {
        if (this.gamepads[this.mainGamepad]) {
          this.controllerName = this.gamepads[this.mainGamepad].id;
        }
      }

      */
      
      
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
              //if(etmButton.pressed) console.log("HEllo")
              gamepad.buttons.push(etmButton);
            }
          } 
      }
      
      
      let msg = {
        start: true,
        gamepads: gamepadsArray
      };       


      //console.log(msg.gamepads);
      //console.log(JSON.parse(JSON.stringify(msg)));
      
      //this.worker.postMessage(JSON.parse(JSON.stringify(msg))); // Start the worker.
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
          //let blob = new Blob([this.doGamepadLoop()], { type: "text/javascript" })
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
          //'self.console.log(navigatorObj);'+
          //'	//gamepads = navigatorObj.getGamepads();'+
          //'	gamepads = msg.gamepads;'+
          //' self.console.log(gamepads);'+
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
         // '	while (doLoop) {'+
         ' if(!gamepads) return;'+
          '		detectControllers(gamepads);'+
          //'self.console.log(gamepads);'+
          //'       self.console.log(mainGamepad);'+
          '		var gamepad = gamepads[mainGamepad];'+
          
          '		if (gamepad && gamepad.connected) {'+
          //'       self.console.log("MARK0");'+
          '			for (var index = 0; index < gamepad.buttons.length; index++) {'+
          '				var button = gamepad.buttons[index];'+
          //'       self.console.log("MARK1");'+
          '				if (((button.value > 0) || (button.pressed))) {'+
          //'       self.console.log("apertou");'+ 
          '       sentinelIndex = index;'+
          '       sentinel += 1;'+
          //'       self.console.log(sentinel);'+
          //'         self.console.log("PRESSED");'+
          '         if(sentinel < 2){'+
          '					  postMessage("doAction");'+
          '         }'+
          '       }'+
          '				if (!button.pressed && index === sentinelIndex){'+
          //'       self.console.log("desapertou");'+        
          '           sentinel=0;'+
          '       }'+
          '			}'+
          '		}'+
          //'	}'+
          '};'+
          ''+
          'self.onmessage = function (msg) {'+          
          //' console.log(msg); '+
          ' msg = msg.data; '+
          ' gamepads = msg.gamepads; '+
          '  if(msg.start){'+
          //' console.log("START = TRUE");'+
          '    animate(gamepads);'+
          '  }else{'+
          //' console.log("START = FALSE");'+
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
    //cancelAnimationFrame(this.cancelationToken);
  }

  public static Create(documentDOM: any): IOpenFacSensor {
    return new OpenFacSensorJoystick(documentDOM);
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

// EM DESENVOLVIMENTO
/*
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
*/      