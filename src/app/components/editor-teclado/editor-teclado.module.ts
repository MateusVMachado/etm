import { EditorTecladoService } from './editor-teclado.service';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TecladoModule } from '../teclado/teclado.module';
import { EditorTecladoComponent } from './editor-teclado.component';
import { EditorComponent } from '../editor/editor.component';
import { EditorModule } from '../editor/editor.module';
import { routes } from "./editor-teclado.routing";

@NgModule({
    declarations: [ EditorTecladoComponent ],
    imports: [ 
        CommonModule, 
        TecladoModule, 
        EditorModule, 
        RouterModule.forChild(routes) 
    ],
    providers: [
        EditorTecladoService
    ]
})
export class EditorTecladoModule {}