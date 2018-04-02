import { OpenFacSensorBase } from './OpenFac.SensorBase';
import { SensorState, IOpenFacSensor } from 'openfac/OpenFac.Sensor.Interface';
import { Subscription } from 'rxjs';
import { ConfigModel } from '../../src/app/components/general-config/config.model';
import { OpenFACLayout } from '../../src/app/components/layout-editor/layout.model';

import { AuthService } from '../../src/app/components/shared/services/auth.services';


export class SoundMeter {

    private Lcontext: AudioContext;
    public instant: number;
    public slow: number;
    public clip: number;
    private script: ScriptProcessorNode;
    private mic: MediaStreamAudioSourceNode;

    constructor(private context: AudioContext){
        this.Lcontext = context;
        this.instant = 0.0;
        this.slow = 0.0;
        this.clip = 0.0;
        this.script = context.createScriptProcessor(2048, 1, 1);
        let that = this;
        this.script.onaudioprocess = function(event) {
          let input = event.inputBuffer.getChannelData(0);
          let i;
          let sum = 0.0;
          let clipcount = 0;
          for (i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
            if (Math.abs(input[i]) > 0.99) {
              clipcount += 1;
            }
          }
          that.instant = Math.sqrt(sum / input.length);
          that.slow = 0.95 * that.slow + 0.05 * that.instant;
          that.clip = clipcount / input.length;
        };
    }


    public connectToSource(stream, callback) {
        //console.log('SoundMeter connecting');
        try {
          this.mic = this.context.createMediaStreamSource(stream);
          this.mic.connect(this.script);
          // necessary to make sample run, but should not be.
          this.script.connect(this.context.destination);
          if (typeof callback !== 'undefined') {
            callback(null);
          }
        } catch (e) {
          console.error(e);
          if (typeof callback !== 'undefined') {
            callback(e);
          }
        }
      };

      public stop() {
        this.mic.disconnect();
        this.script.disconnect();
      };


}


////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

export class OpenFacSensorMicrophone extends OpenFacSensorBase {
 
    private openFacLayout: OpenFACLayout;
    private configServiceSubscribe: any;
    private worker: any;
    private soundMeter: SoundMeter;
    private audioContext: AudioContext;
    private stream: any;
    private tecladoService: any;
    private configService: any;
    private level: number;
    private levelSubscription: Subscription;
    private user: any;
    public config: any = {};
    private on: boolean;

    constructor(private args: any){
        super();
        this.tecladoService = this.args[0];
        this.configService = this.args[1];
        this.user = this.args[2];
        this.level = this.args[3];

        this.on = true;
    }


    public Dispose(): void {      
      this.Stop();
    }
    
    public IsTrigged(): boolean {
        return false;
    }

    public Start(): void {
        this.on = true;
        this.startWorker();

    }

    public Stop(): void{
        this.audioContext.close();
        this.on = false;
      }

    public Open(): void {

    }

    public handleError(error) {
        console.log('navigator.getUserMedia error: ', error);
    }


    public handleSuccess(stream){
        let self = this;
        if(!self.on) return;

        let level = self.level;
        let levelsSample = new Array();
        
        self.stream = stream;

        let soundMeter =  new SoundMeter(this.audioContext);   

        soundMeter.connectToSource(this.stream, function(e) {
                if (e) {
                    alert(e);
                    return;
                }
                let flag = true;
                let time2 = setInterval(function(){
                    if(flag){
                        let time = setInterval(function() {
                        if(!self.on){
                            clearInterval(time);
                            clearInterval(time2);
                            return;
                        }
                            
                        if(self.levelSubscription === undefined ){
                            self.levelSubscription =  self.configService.subscribeToGeneralConfigPayloadSubject().subscribe((result)=>{
                                if(result) {
                                    self.level = result;
                                    if(self.levelSubscription !== undefined ) self.levelSubscription.unsubscribe();  
                                }    
                            });
                        }    
                        let level = Number(self.level.toFixed(2))*1000;    
                        let value = Number(soundMeter.instant.toFixed(2)) * 1000;
                    
                        //console.log('instant: ' + value );
                        //console.log('slow: ' + soundMeter.slow.toFixed(2) );
                        //console.log('clip: ' + soundMeter.clip);
                        //console.log('LEVEL: ' + level);
                        //console.log(self.on);

                        levelsSample.push(value);

                        if(levelsSample.length === 300){
                        let sum = 0;
                        for(let i =0 ; i<levelsSample.length; i++ ){
                            sum += levelsSample[i];
                        }
                        //level = (sum/levelsSample.length)*1.20;
                        }
                        
                        if(Number(soundMeter.instant.toFixed(2)) * 1000 > level) {
                            self.executeDoAction();
                            flag = true;
                            clearInterval(time);
                        } else {
                        flag = false;
                        }   
                    }, 200);
                    if(self.levelSubscription !== undefined ) self.levelSubscription.unsubscribe();  
                    }  
                }, 2000);
        });
        if(self.levelSubscription  !== undefined ) self.levelSubscription.unsubscribe(); 
    }


    public startWorker() {
        if(!this.on) return;
        this.audioContext = new AudioContext;

        'use strict';
        let self = this;

        try {
          (window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
        } catch (e) {
          alert('Web Audio API not supported.');
        }

        let constraints = (window as any).constraints = {
          audio: true,
          video: false
        };
  
        navigator.mediaDevices.getUserMedia(constraints).then(this.handleSuccess.bind(this)).catch(this.handleError);
    }    


     public executeDoAction(msg?){
        this.tecladoService.emitTecladoCommand("spoked");
        this.DoAction(0); 
     }

     public stopWorker() { 
       
      }

      public static Create(documentDOM?: any): IOpenFacSensor {
        return new OpenFacSensorMicrophone(documentDOM);
      }  

}