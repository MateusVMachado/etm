import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-gamepad'
})
export class GamepadComponent implements OnInit, OnDestroy {

  private cancelationToken: number;
  private gamepads: Gamepad[];
  private gamepad: any;
  public keyPressed: String;
  public controllerName: String;

  public main_gamepad: number = 3;

  private lastPressedButton: Number;

  constructor(private zone: NgZone) {
    this.lastPressedButton = -1;
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
    this.cancelationToken = requestAnimationFrame(this.doGamepadLoop.bind(this));

    this.detectControllers();
    const gamepad = this.gamepads[this.main_gamepad];
    if (gamepad && gamepad.connected) {

        for (let index = 0; index < gamepad.buttons.length; index++) {
          const button = gamepad.buttons[index];
  
          if (((button.value > 0) || (button.pressed))) {
            console.log("botão " + index + ': ' + button.value);
            this.keyPressed = button.pressed + " " + button.value;
          }
        }
      }

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    cancelAnimationFrame(this.cancelationToken);
  }

}
