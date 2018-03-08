import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';
import { LayoutEditorComponent } from './layout-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    ThemeModule,
  ],
  declarations: [
    LayoutEditorComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LayoutEditorModule { }
