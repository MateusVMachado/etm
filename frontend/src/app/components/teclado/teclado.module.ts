import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { TecladoBaseModule } from '../teclado-base/teclado-base.module';
import { TecladoComponent } from './teclado.component';
import { TecladoService } from './teclado.service';
import { PredictorService } from '../predictor/predictor.service';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AngularSplitModule,
        TecladoBaseModule
    ],
    declarations: [
        TecladoComponent
    ],
    exports: [
        TecladoComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    providers: [
        TecladoService,
        PredictorService
    ]
})
export class TecladoModule { }