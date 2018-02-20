import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TecladoModule } from '../teclado/teclado.module';
import { EditorTecladoComponent } from './editor-teclado.component';
import { EditorComponent } from '../editor/editor.component';
import { EditorModule } from '../editor/editor.module';

@NgModule({
    declarations: [ EditorTecladoComponent ],
    imports: [ CommonModule, TecladoModule, EditorModule ],
    exports: [],
    providers: [],
})
export class EditorTecladoModule {}