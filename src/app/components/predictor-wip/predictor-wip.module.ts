import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictorWipComponent } from './predictor-wip.component';
import { RouterModule } from '@angular/router';
import { predictorWipRoute } from './predictor-wip.routing';
import { FormsModule } from '@angular/forms';
import { TecladoModule } from '../teclado/teclado.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(predictorWipRoute),
    TecladoModule
  ],
  declarations: [PredictorWipComponent]
})
export class PredictorWipModule { }
