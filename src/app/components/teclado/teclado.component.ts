import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbMenuItem } from '@nebular/theme';
import * as moment from 'moment';
import * as $ from 'jquery';
import { OpenFACLayout } from 'openfac/OpenFac.ConfigContract';
import { Subscription } from 'rxjs';

import { OpenFacActionFactory } from '../../../../node_modules/openfac/OpenFac.ActionFactory';
import { OpenFacActionKeyboardAndTTS } from '../../../../node_modules/openfac/OpenFac.ActionKeyboardAndTTS';
import { OpenFacActionKeyboardWriter } from '../../../../node_modules/openfac/OpenFac.ActionKeyboardWriter';
import { OpenFacActionTTS } from '../../../../node_modules/openfac/OpenFac.ActionTTS';
import { OpenFacConfig } from '../../../../node_modules/openfac/OpenFac.Config';
import { EngineState, OpenFacEngine } from '../../../../node_modules/openfac/OpenFac.Engine';
import { OpenFacKeyboardFactory } from '../../../../node_modules/openfac/OpenFac.KeyboardFactory';
import { OpenFacKeyboardQWERT } from '../../../../node_modules/openfac/OpenFac.KeyboardQWERT';
import { OpenFacKeyCommandService } from '../../../../node_modules/openfac/OpenFac.KeyCommand.service';
import { OpenFacSensorFactory } from '../../../../node_modules/openfac/OpenFac.SensorFactory';
import { OpenFacSensorJoystick } from '../../../../node_modules/openfac/OpenFac.SensorJoystick';
import { OpenFacSensorMicrophone } from '../../../../node_modules/openfac/OpenFac.SensorMicrophone';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import { ConfigModel } from '../general-config/config.model';
import { GeneralConfigService } from '../general-config/general-config.service';
import { TimeIntervalUnit, UserSessionModel } from '../shared/models/userSession.model';
import { AuthService } from '../shared/services/auth.services';
import { BackLoggerService } from '../shared/services/backLogger.service';
import { SideBarService } from '../sidebar/sidebar.service';
import { ActiveLineCol } from './activeLine.model';
import { TecladoModel } from './teclado.model';
import { TecladoService } from './teclado.service';

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
  private routeSubscription: Subscription;
  private tecladoServiceSubscription: Subscription;
  private capsIndex: number;
  private ptbrIndex: number; 
  private timerId: number;
  private timeoutId: any;
  private scanTimeLines: number;
  private scanTimeColumns: number;
  private audioContext: AudioContext = new AudioContext();

  public menu: NbMenuItem[];
  public jsonArray = new Array();

  public target: any;

  public ledOn: boolean = false;
  public micOn: boolean = false;

  private userSession: UserSessionModel;
  private timeInterval: TimeIntervalUnit;

  public once: number  = 0;
  public level: number;

  public configurations: any;


  public cursorPosition: number = 0;
  private maxLength: number = 0;

  constructor(private tecladoService: TecladoService, 
              private editorTecladoService: EditorTecladoService, 
              private zone: NgZone,
              private sideBarService: SideBarService,
              private configService: GeneralConfigService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private backLoggerService: BackLoggerService) {

              this.userSession = new UserSessionModel();
              this.userSession.keyboardIntervals = new Array();
              this.timeInterval = new TimeIntervalUnit();

              this.timeInterval.inTime = moment().format("HH:mm:ss");

              this.teclado.teclas = [];
              this.teclado.text = [];
              this.teclado.action = [];
              this.teclado.image = [];

              let user = this.authService.getLocalUser();
              this.userSession.user = user.email; 


              this.keyCommandService = new OpenFacKeyCommandService();

              this.tecladoServiceSubscription = this.tecladoService.subscribeToTecladoSubject().subscribe((result)=>{
                if(result === "pressed"){
                  this.ledOn = true;
                  clearInterval(this.timeoutId);
                  this.timeoutId =  setTimeout(this.turnLEDoff.bind(this), 500) ;
                } else if (result === "spoked"){
                  this.micOn = true;
                  clearInterval(this.timeoutId);
                  this.timeoutId =  setTimeout(this.turnMICoff.bind(this), 500) ;
                }

              })

              this.routeSubscription = this.route.queryParams.subscribe(params => { // Defaults to 0 if no query param provided.
                    this.target = params['target'];
             
                    let user = this.authService.getLocalUser();

                    this.tecladoService.loadDataFromUser(user.email).subscribe((data)=>{
                      if(data){
                        this.KeyboardData = data;

                        let lastUsed: number = 0;
                      } 

                    if(this.target && this.KeyboardData){
                      for (let j = 0; j < this.KeyboardData.length; j++) {
                        if (this.KeyboardData[j].nameLayout === 'caps') continue;
                        if (this.target === this.KeyboardData[j].nameLayout) {

                          this.convertLayoutToKeyboard(this.teclado, this.KeyboardData[j]); //// ALTERADO RECENTEMENTE
                          
                          this.configService.saveOnlyLastKeyboard(this.teclado.type).subscribe();  
                          break;
                        }
                      }    
                }    

              });
          });      
  

  }

  private turnLEDoff(){
    this.ledOn = false;
  }

  private turnMICoff(){
    this.micOn = false;
  }

  ngOnDestroy(): void {
     this.keyCommandServiceSubscribe.unsubscribe();
     this.editorTecladoServiceSubscribe.unsubscribe();
     this.sideBarServiceSubscribe.unsubscribe();
     this.configServiceSubscribe.unsubscribe();
     this.tecladoServiceSubscription.unsubscribe();

     this.timeInterval.outTime = moment().format('HH:mm:ss');
     this.userSession.keyboardIntervals.push(this.timeInterval);
     this.backLoggerService.sendKeyboardIntervalNow(this.userSession).subscribe(()=>{   });

     this.engine.Stop();
  }

  ngOnInit() { ///////////////////////////////////// ALTERADO RECENTEMENTE DE ngAfterViewInit PARA ngOnInit ///////////////////////////////////

    this.teclado.teclas = [];

    // CHECA SE USUÁRIO ACIONOU O CAPSLOCK
    this.keyCommandServiceSubscribe = this.keyCommandService.subscribeToKeyCommandSubject().subscribe((result) =>{
        if(result === 'caps'){
          this.capsLock();
        }
    });

    let user = this.authService.getLocalUser();

    this.tecladoService.loadDataFromUser(user.email).subscribe((data)=>{

      if(data){
        this.KeyboardData = data;

        let lastUsed: number = 0;
        this.configServiceSubscribe = 
                        this.configService.returnLastUsed(lastUsed, this.openFacLayout, data)
                        .subscribe((result: ConfigModel) => {
          this.configurations = result;

          this.config.lastKeyboard = result.lastKeyboard;
          this.scanTimeLines = result.openFacConfig.ScanTimeLines;
          this.scanTimeColumns = result.openFacConfig.ScanTimeColumns;
          this.level = result.level;

          let found = false;
          for(let i=0; i < this.KeyboardData.length; i++){
            if(this.KeyboardData[i].nameLayout === 'caps') continue;
              if(this.target === this.KeyboardData[i].nameLayout){
                  lastUsed = i;
                  this.openFacLayout = (data[lastUsed]);
                  found = true;
                  break;
              }
          }                                    
          if(!found) this.openFacLayout = (data[0]);  



          this.convertLayoutToKeyboard(this.teclado, this.openFacLayout);

          this.configureAll();

              this.tecladoService.emitTecladoReady(true);

              this.editorTecladoServiceSubscribe = 
                      this.editorTecladoService.subscribeToEditorSubject().subscribe((editor) => {
                        
                  this.configureAll(editor);
                  

              });
              
                this.sideBarServiceSubscribe = this.sideBarService.subscribeTosideBarSubject().subscribe((result) =>{
                  
                      this.tecladoService.loadDataFromUser(user.email).subscribe((data)=>{
                          this.KeyboardData = data;

                          let found = false;
                          for(let i=0; i < this.KeyboardData.length; i++){
                            if(this.KeyboardData[i].nameLayout === 'caps') continue;
                              if(this.target === this.KeyboardData[i].nameLayout){
                                  lastUsed = i;
                                  this.openFacLayout = (data[lastUsed]);
                                  found = true;
                                  break;
                              }
                          }                                    
                          if(!found) this.openFacLayout = (data[0]); 
                          this.convertLayoutToKeyboard(this.teclado, this.openFacLayout);

                          this.configureSome(); 
                          this.tecladoService.emitTecladoReady(true);  

                          
                      });    
                });

        });
      }
    });

  }

  ngAfterViewInit(){
    
  }

  private convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){
      this.openFacLayout = layout;
      this.teclado.teclas = [];
      this.teclado.text = [];
      this.teclado.action = []; 
      this.teclado.image = []; 

      for(let i = 0 ; i < layout.Lines.length; i++){ 
        let line = []; 
        let textL = []; 
        let actionL = [];  
        let imageL = [];  
        for( let j = 0 ; j < layout.Lines[i].Buttons.length; j++){ 
          line.push(layout.Lines[i].Buttons[j].Caption); 
          textL.push(layout.Lines[i].Buttons[j].Text); 
          actionL.push(layout.Lines[i].Buttons[j].Action);  
          if(layout.Lines[i].Buttons[j].Image !== undefined){
            imageL.push(layout.Lines[i].Buttons[j].Image);  
          }
          
        } 
        this.teclado.teclas.push(line);  
        this.teclado.text.push(textL); 
        this.teclado.action.push(actionL); 
        if(imageL.length > 0) this.teclado.image.push(imageL); 
      } 
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
  
        this.config = new OpenFacConfig(this.configurations, this.openFacLayout); 
        this.engine = new OpenFacEngine(this.config);
        this.engine.DoCallBack(this.DoCallBack.bind(this));
        this.engine.Start();
        setTimeout(this.adjustKeys.bind(this), 1000); //Need to be executed after html elements rendering

  }

  private configureAll(editorInstance?: any) {
        if(editorInstance){
          let configArray = [editorInstance, this.keyCommandService, this.zone];
          let configArrayWriters = [editorInstance, this.keyCommandService, this.zone, this.cursorPosition, this.maxLength];
          OpenFacActionFactory.Register('TTS', OpenFacActionTTS, configArray);
          OpenFacActionFactory.Register('Keyboard', OpenFacActionKeyboardWriter, configArrayWriters);
          OpenFacActionFactory.Register('KeyboardAndTTS', OpenFacActionKeyboardAndTTS, configArrayWriters);
        }

     
        clearInterval(this.timerId);
        
        let user = this.authService.getLocalUser();
        let configJoystickArray = [this.tecladoService];

        let configMicrophoneArray = [this.tecladoService, this.configService, this.level, this.audioContext];
        
        OpenFacSensorFactory.Register('Joystick', OpenFacSensorJoystick, configJoystickArray);
      
        OpenFacSensorFactory.Register('Microphone', OpenFacSensorMicrophone, configMicrophoneArray);
      
        OpenFacKeyboardFactory.Register('QWERT', OpenFacKeyboardQWERT);
        

        this.config = new OpenFacConfig(this.configurations, this.openFacLayout); 
        this.engine = new OpenFacEngine(this.config);
        this.engine.DoCallBack(this.DoCallBack.bind(this));
        
        this.engine.Start();  

        this.timerId = setInterval(this.timer1_Tick.bind(this), this.scanTimeLines*1000);


        setTimeout(this.adjustKeys.bind(this), 1000); //Need to be executed after html elements rendering
        

      
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

  public adjustKeys(){
        console.log("--------------ADJUST KEYS-----------------");
        console.log(JSON.stringify(this.teclado.teclas) );
        console.log(JSON.stringify(this.teclado.text) );
        console.log(JSON.stringify(this.teclado.action) );

        console.log('\nTAMANHO: ' + this.teclado.image.length + '\n')


        if(this.teclado.image.length !== 0){

                for(let line = 0; line < this.teclado.teclas.length; line ++ ){
                  for(let col = 0 ; col < this.teclado.teclas[line].length; col ++){
                    let el = $('#images'+line+'x'+col)[0];
                    let sElLines = $('[id=sElLines]');
                    let sElRows = $('[id=sElRows]');


                    let height =  this.teclado.teclas[line][col].split('$')[1].split('#')[0];
                    let width = this.teclado.teclas[line][col].split('$')[1].split('#')[1];
                    $(el).css("height", height);
                    $(el).css("width", width);


                    $($(sElLines)[line]).css('height', height);
                    $($(sElRows)[line]).css('height', height); 

                    
                    $(el).css("background", "url("+ this.teclado.image[line][col] +") no-repeat");
                    
                    let params = <string>(100 + '% ' + 100 + '%');
                    $(el).css("background-size", params);
                    

                    $(el).css("transform", 'translateX('+ 20 +'%)');

                    $($(sElLines)[line]).css('margin-bottom', 4 );
                    $($(sElRows)[line]).css('margin-bottom', 4 );
   
                  }
                }

        }   
  }


}
