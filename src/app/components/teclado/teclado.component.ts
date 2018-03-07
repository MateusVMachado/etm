import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { OpenFacSensorFactory } from '../../../../node_modules/openfac/OpenFac.SensorFactory';
import { OpenFacActionFactory } from '../../../../node_modules/openfac/OpenFac.ActionFactory';
import { OpenFacKeyboardFactory } from '../../../../node_modules/openfac/OpenFac.KeyboardFactory';
import { OpenFacActionKeyboardWriter } from '../../../../node_modules/openfac/OpenFac.ActionKeyboardWriter';
import { OpenFacSensorJoystick } from '../../../../node_modules/openfac/OpenFac.SensorJoystick';
import { OpenFacKeyboardQWERT } from '../../../../node_modules/openfac/OpenFac.KeyboardQWERT';
import { OpenFacConfig } from '../../../../node_modules/openfac/OpenFac.Config';
import { OpenFacEngine, EngineState } from '../../../../node_modules/openfac/OpenFac.Engine';
import { KeyboardData } from '../../storage';
import { TecladoModel } from './teclado.model';
import { TecladoService } from './teclado.service';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import { OpenFACLayout } from 'openfac/OpenFac.ConfigContract';
import { OpenFacKeyCommandService } from '../../../../node_modules/openfac/OpenFac.KeyCommand.service';
import { SideBarService } from '../sidebar/sidebar.service';
import { GeneralConfigService } from '../general-config/general-config.service';
import { ConfigModel } from '../general-config/config.model';
import { ActiveLineCol } from './activeLine.model';
import { Subscription } from 'rxjs';

import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'app-teclado',
  templateUrl: './teclado.component.html',
  styleUrls: ['./teclado.component.css']
})
export class TecladoComponent implements OnInit, OnDestroy {

  public openFacLayout: OpenFACLayout;
  public activeLine: ActiveLineCol = new ActiveLineCol();
  public config: any = {};
  public engine: OpenFacEngine;
  public KeyboardData: any;
  public teclado: TecladoModel = new TecladoModel();
  public data = [];
  private keyCommandService: OpenFacKeyCommandService;
  private keyCommandServiceSubscribe: Subscription;
  private editorTecladoServiceSubscribe: Subscription;
  private sideBarServiceSubscribe: Subscription;
  private configServiceSubscribe: Subscription;
  private capsIndex: number;
  private ptbrIndex: number; 
  private timerId: number;
  private scanTimeLines: number;
  private scanTimeColumns: number;
  

  public menu: NbMenuItem[];
  public jsonArray = new Array();

  constructor(private tecladoService: TecladoService, 
              private editorTecladoService: EditorTecladoService, 
              private zone: NgZone,
              private sideBarService: SideBarService,
              private configService: GeneralConfigService) {

              this.keyCommandService = new OpenFacKeyCommandService();
  }

  ngOnDestroy(): void {
     this.keyCommandServiceSubscribe.unsubscribe();
     this.editorTecladoServiceSubscribe.unsubscribe();
     this.sideBarServiceSubscribe.unsubscribe();
     this.configServiceSubscribe.unsubscribe();
  }

  ngOnInit() { }

  ngAfterViewInit(){

    this.teclado.teclas = [];

    // CHECA SE USUÁRIO ACIONOU O CAPSLOCK
    this.keyCommandServiceSubscribe = this.keyCommandService.subscribeToKeyCommandSubject().subscribe((result) =>{
        if(result === 'caps'){
          this.capsLock();
        }
    })

      this.editorTecladoServiceSubscribe = 
                  this.editorTecladoService.subscribeToEditorSubject().subscribe((editor) =>{

            this.tecladoService.loadData().subscribe((data)=>{
              if(data){
                this.KeyboardData = data;
                for(let i = 0; i < this.KeyboardData.length; i++){
                  if(this.KeyboardData[i].nameLayout === 'caps'){
                      this.capsIndex = i;
                  } else if (this.KeyboardData[i].nameLayout === 'pt-br'){
                    this.ptbrIndex = i;
                  }   
                }
                
                // CHECA QUAL TIPO DE TECLADO FOI ESCOLHIDO            
                let lastUsed: number = 0;
        
                this.configServiceSubscribe = 
                                this.configService.returnLastUsed(lastUsed, this.openFacLayout, data)
                                .subscribe((result: ConfigModel) => {

                      this.config.lastKeyboard = result.lastKeyboard;
                      this.scanTimeLines = result.openFacConfig.ScanTimeLines;
                      this.scanTimeColumns = result.openFacConfig.ScanTimeColumns;

                      let found = false;
                      for(let i=0; i < this.KeyboardData.length; i++){
                        if(this.KeyboardData[i].nameLayout === 'caps') continue;
                        if(this.config.lastKeyboard === this.KeyboardData[i].nameLayout){
                          lastUsed = i;
                          this.openFacLayout = (data[lastUsed]);
                          found = true;
                          break;
                        }
                      }                                    
                if(!found) this.openFacLayout = (data[0]);  

                this.convertLayoutToKeyboard(this.teclado, this.openFacLayout);
                this.configureAll(editor);

              });

                this.sideBarServiceSubscribe = this.sideBarService.subscribeTosideBarSubject().subscribe((result) =>{
                                  for (let j = 0; j < this.KeyboardData.length; j++) {
                                    if (this.KeyboardData[j].nameLayout === 'caps') continue;
                                    if (result === this.KeyboardData[j].nameLayout) {
                                      this.convertLayoutToKeyboard(this.teclado, this.KeyboardData[j]);
                                      this.configureSome(); 
                                      this.configService.saveOnlyLastKeyboard(this.teclado.type).subscribe();  
                                      break;
                                    }
                                  }    
                });
              }
          })

    });
  
  }

  private loadSingleKeyboardByName(nameLayout: string){
    this.tecladoService.loadSingleKeyboard(nameLayout).subscribe((data)=>{
      console.log(data[0]);
    });

  }


  private convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){
      this.openFacLayout = layout;
      this.teclado.teclas = [];
      layout.Lines.forEach(element => {
          let line = [];
          element.Buttons.forEach(element => {
              line.push(element.Text);
          });
          this.teclado.teclas.push(line);
          
      });
      this.teclado.type = layout.nameLayout;
  }

  public capsLock() {
    if (this.teclado.type === 'pt-br') {
            this.convertLayoutToKeyboard(this.teclado, this.KeyboardData[this.capsIndex]);
    } else {
            this.convertLayoutToKeyboard(this.teclado, this.KeyboardData[this.ptbrIndex]);

    }
    this.configureSome();
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

  private configureSome(){
    this.config = new OpenFacConfig('config.file', this.openFacLayout); 
    this.engine = new OpenFacEngine(this.config);
    this.engine.DoCallBack(this.DoCallBack.bind(this));
    this.engine.Start();
  }

  private configureAll(editorInstance: any) {
    let configArray = [editorInstance, this.keyCommandService, this.zone]
    OpenFacActionFactory.Register('Keyboard', OpenFacActionKeyboardWriter, configArray);
    //OpenFacSensorFactory.Register('Microphone', OpenFacSensorMicrophone);
    OpenFacSensorFactory.Register('Joystick', OpenFacSensorJoystick);
    OpenFacKeyboardFactory.Register('QWERT', OpenFacKeyboardQWERT);
    
    this.config = new OpenFacConfig('config.file', this.openFacLayout); 
    this.engine = new OpenFacEngine(this.config);
    this.engine.DoCallBack(this.DoCallBack.bind(this));
    this.engine.Start();
   
    this.timerId = setInterval(this.timer1_Tick.bind(this), this.scanTimeLines*1000);
  }

  private timer1_Tick(): void {
    if (this.engine !== null) {
      if (this.engine.CurrentState() == EngineState.LineDown) {
        clearInterval(this.timerId);  
        this.engine.CalculateNextLine();
        this.timerId = setInterval(this.timer1_Tick.bind(this), this.scanTimeLines*1000);
      }
      else if (this.engine.CurrentState() == EngineState.ColumnRight) {
        clearInterval(this.timerId);
        this.engine.CalculateNextButton();
        this.timerId = setInterval(this.timer1_Tick.bind(this), this.scanTimeColumns*1000);
      }
    }
  }

}
