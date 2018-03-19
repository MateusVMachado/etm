import { NgModule } from '@angular/core';
import { TecladoComponent } from './teclado.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TecladoService } from './teclado.service';

import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        TecladoComponent
    ],
    exports: [
        TecladoComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class TecladoModule { }
