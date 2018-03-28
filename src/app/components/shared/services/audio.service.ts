import { Injectable } from "@angular/core";


@Injectable()
export class AudioService {

  public level: number = 250;
  public levelsSample: Array<number>;

  constructor(){

  }



  public main(){

    
    /*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* global AudioContext, SoundMeter */

'use strict';

//var instantMeter = document.querySelector('#instant meter');
//var slowMeter = document.querySelector('#slow meter');
//var clipMeter = document.querySelector('#clip meter');

//var instantValueDisplay = document.querySelector('#instant .value');
//var slowValueDisplay = document.querySelector('#slow .value');
//var clipValueDisplay = document.querySelector('#clip .value');

try {
  (window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  (window as any).audioContext = new AudioContext();
} catch (e) {
  alert('Web Audio API not supported.');
}

// Put variables in global scope to make them available to the browser console.
var constraints = (window as any).constraints = {
  audio: true,
  video: false
};

function handleSuccess(stream) {
  let levelsSample = new Array();
  let level = 250;
  // Put variables in global scope to make them available to the
  // browser console.
  (window as any).stream = stream;
  var soundMeter = (window as any).soundMeter = new SoundMeter((window as any).audioContext);
  soundMeter.connectToSource(stream, function(e) {
    if (e) {
      alert(e);
      return;
    }
    let flag = true;
    setInterval(function(){
       if(flag){
          let time = setInterval(function() {
          console.clear();
         
          let value = soundMeter.instant.toFixed(2) * 1000 ;
         
          console.log('instant: ' + value );
          console.log('slow: ' + soundMeter.slow.toFixed(2) * 1000 );
          console.log('clip: ' + soundMeter.clip);
          console.log('LEVEL: ' + level);
          
          levelsSample.push(value);

          if(levelsSample.length === 100){
            let sum = 0;
            for(let i =0 ; i<levelsSample.length; i++ ){
              sum += levelsSample[i];
            }
            //level = (sum/levelsSample.length)*1.20;
          }
          if(soundMeter.instant.toFixed(2) * 1000 > level) {
              console.log("COMMAND EXECUTED");
              flag = true;
              clearInterval(time);
          } else {
            flag = false;
          }   
          //instantMeter.value = instantValueDisplay.innerText =
          //    soundMeter.instant.toFixed(2);
          //slowMeter.value = slowValueDisplay.innerText =
          //    soundMeter.slow.toFixed(2);
          //clipMeter.value = clipValueDisplay.innerText =
          //    soundMeter.clip;
        }, 200);
      }  
    }, 2000);
  });
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);


/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Meter class that generates a number correlated to audio volume.
// The meter class itself displays nothing, but it makes the
// instantaneous and time-decaying volumes available for inspection.
// It also reports on the fraction of samples that were at or near
// the top of the measurement range.
function SoundMeter(context) {
  this.context = context;
  this.instant = 0.0;
  this.slow = 0.0;
  this.clip = 0.0;
  this.script = context.createScriptProcessor(2048, 1, 1);
  var that = this;
  this.script.onaudioprocess = function(event) {
    var input = event.inputBuffer.getChannelData(0);
    var i;
    var sum = 0.0;
    var clipcount = 0;
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

SoundMeter.prototype.connectToSource = function(stream, callback) {
  console.log('SoundMeter connecting');
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
SoundMeter.prototype.stop = function() {
  this.mic.disconnect();
  this.script.disconnect();
};




  }

public audio(){
  /*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Put variables in global scope to make them available to the browser console.
var audio = document.querySelector('audio');

var constraints = (window as any).constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  var audioTracks = stream.getAudioTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using audio device: ' + audioTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream ended');
  };
  (window as any).stream = stream; // make variable available to browser console
  audio.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);
}

}