import { Component, OnInit, Output, Input, ViewChild, NgZone } from '@angular/core';


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
import { OpenFacSensorJoystick } from '../../../../node_modules/openfac/OpenFac.SensorJoystick';
import { OpenFacKeyboardQWERT } from '../../../../node_modules/openfac/OpenFac.KeyboardQWERT';
import { OpenFacConfig } from '../../../../node_modules/openfac/OpenFac.Config';
import { OpenFacEngine, EngineState } from '../../../../node_modules/openfac/OpenFac.Engine';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { KeyboardData } from '../../storage';
import { ActiveLineCol } from './activeLine.model';

import { TecladoModel } from './teclado.model';
import { TecladoService } from './teclado.service';

import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import { OpenFACLayout } from 'openfac/OpenFac.ConfigContract';


@Component({
  selector: 'app-teclado',
  templateUrl: './teclado.component.html',
  styleUrls: ['./teclado.component.css']
})
export class TecladoComponent implements OnInit {

  public openFacLayout: OpenFACLayout;

  public activeLine: ActiveLineCol = new ActiveLineCol();

  public config: IOpenFacConfig;
  public engine: OpenFacEngine;
  public timer: boolean;
  public colorLine: boolean;

  public teclado: TecladoModel = new TecladoModel();
  public data = [];

  constructor(private tecladoService: TecladoService, private editorTecladoService: EditorTecladoService, private zone: NgZone) {
  }

  ngAfterViewInit(){
    
  }

  ngOnInit() {
    this.teclado.teclas = [];

    this.editorTecladoService.subscribeToEditorSubject().subscribe((editor) =>{
      this.zone.run(() => {
          this.tecladoService.loadData().subscribe((data)=>{
              if(data){
                this.openFacLayout = (data[0]);
                this.convertLayoutToKeyboard(this.teclado, this.openFacLayout);
                this.configureAll(editor);
              }
          })
      });
    })

  }

  private convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){

      layout.Lines.forEach(element => {
          let line = [];
          element.Buttons.forEach(element => {
              line.push(element.Text);
          });
          this.teclado.teclas.push(line);
          
      });
      //console.log(this.teclado);
  }


  private capsLock() {
    if (this.teclado.type === 'normal') {
      this.teclado = <TecladoModel>(KeyboardData.data[1]);
    } else {
      this.teclado = <TecladoModel>(KeyboardData.data[0]);
    }
  }

  private ChangeButtonColor(engine: OpenFacEngine, button: number, cor: string): void {
    this.activeLine.col = button;
    this.activeLine.type = 'col';
    this.activeLine.cor = cor;
  }

  private ChangeLineColor(engine: OpenFacEngine, line: number, cor: string): void {
    this.activeLine.line = line;
    this.activeLine.col = 0;
    this.activeLine.type = 'linha';
    this.activeLine.cor = cor;
  }

  private DoLineUp(engine: OpenFacEngine): void {
    this.ChangeLineColor(engine, engine.GetPriorRowNumber(), 'white');
    this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'yellow');
  }

  private DoLineDown(engine: OpenFacEngine): void {
    this.ChangeLineColor(engine, engine.GetPriorRowNumber(), 'white');
    this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'yellow');
  }
  private DoColumnRight(engine: OpenFacEngine): void {
    this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
    this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'red');
  }
  private DoColumnLeft(engine: OpenFacEngine): void {
    this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
    this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'red');
  }
  private DoAction(engine: OpenFacEngine): void {
    this.ChangeLineColor(engine, engine.GetCurrentRowNumber(), 'white');
    this.ChangeButtonColor(engine, engine.GetCurrentColumnNumber(), 'yellow');
  }


  public DoCallBack(engine: OpenFacEngine): boolean {
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


  private configureAll(editorInstance: any) {
    OpenFacActionFactory.Register('Keyboard', OpenFacActionKeyboardWriter, editorInstance);

    //OpenFacSensorFactory.Register('Microphone', OpenFacSensorMicrophone);
    OpenFacSensorFactory.Register('Joystick', OpenFacSensorJoystick);
    OpenFacKeyboardFactory.Register('QWERT', OpenFacKeyboardQWERT);
    
    this.config = new OpenFacConfig('config.file', this.openFacLayout); 
    this.engine = new OpenFacEngine(this.config);
    this.engine.DoCallBack(this.DoCallBack.bind(this));
    this.engine.Start();

    this.timer = true;    
    setInterval(this.timer1_Tick.bind(this), 1500);
  }

  private timer1_Tick(): void {
    if (this.engine !== null) {
      if (this.engine.CurrentState() == EngineState.LineDown) {
        this.engine.CalculateNextLine();
      }
      else if (this.engine.CurrentState() == EngineState.ColumnRight) {
        this.engine.CalculateNextButton();
      }
    }
  }

}
