import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictorComponent } from './predictor.component';
import { RouterModule } from '@angular/router';
import { predictorRoute } from './predictor.routing';
import { FormsModule } from '@angular/forms';
import { TecladoModule } from '../teclado/teclado.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(predictorRoute),
    TecladoModule
  ],
  declarations: [PredictorComponent]
})
export class PredictorModule { }
