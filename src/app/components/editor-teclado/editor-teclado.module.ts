import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AngularSplitModule } from 'angular-split';
import { EditorModule } from '../editor/editor.module';
import { TecladoModule } from '../teclado/teclado.module';
import { EditorTecladoComponent } from './editor-teclado.component';
import { routes } from "./editor-teclado.routing";

@NgModule({
    declarations: [ EditorTecladoComponent ],
    imports: [ 
        CommonModule, 
        TecladoModule, 
        EditorModule, 
        AngularSplitModule,
        RouterModule.forChild(routes) 
    ],
    providers: []
})
export class EditorTecladoModule {}