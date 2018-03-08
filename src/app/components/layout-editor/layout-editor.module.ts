import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';
import { LayoutEditorComponent } from './layout-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DragulaModule } from  'ng2-dragula/ng2-dragula';

@NgModule({
  imports: [
    ThemeModule,
    DragulaModule,
  ],
  declarations: [
    LayoutEditorComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LayoutEditorModule { }
