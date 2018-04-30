import { NgModule } from '@angular/core';
import { TecladoComponent } from './teclado.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TecladoService } from './teclado.service';

import { FormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AngularSplitModule,
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
        TecladoService
    ]
})
export class TecladoModule { }
