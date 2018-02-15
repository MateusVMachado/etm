import { NgModule } from '@angular/core';
import { TecladoComponent } from './teclado.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TeclaComponent } from './tecla/tecla.component';

import { CommonModule } from '@angular/common';
import { TeclaService } from './tecla/tecla.service';
import { EditorModule } from '@tinymce/tinymce-angular';
import { CKEditorModule } from 'ng2-ckeditor';

import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        EditorModule,
        FormsModule,
        CKEditorModule
    ],
    declarations: [
        TecladoComponent,
        TeclaComponent
    ],
    providers: [
        TeclaService
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class TecladoModule { }
