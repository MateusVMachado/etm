import { NgModule } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TeclaComponent } from './tecla.component';

import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';

import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        EditorModule,
        FormsModule
    ],
    declarations: [
        TeclaComponent
    ],
    providers: [
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class TecladoModule { }
