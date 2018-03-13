import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';
import { LayoutEditorComponent } from './layout-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DragulaModule } from  'ng2-dragula/ng2-dragula';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';


@NgModule({
  imports: [
    ThemeModule,
    DragulaModule,
  ],
  declarations: [
    LayoutEditorComponent,
    LayoutModalComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    LayoutModalComponent
  ]
})
export class LayoutEditorModule { }
