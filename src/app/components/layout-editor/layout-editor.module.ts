import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';
import { LayoutEditorComponent } from './layout-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DragulaModule } from  'ng2-dragula/ng2-dragula';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';
import { DeleteLayoutModalComponent } from './delete-layout/delete-layout-modal.component';

@NgModule({
  imports: [
    ThemeModule,
    DragulaModule,
  ],
  declarations: [
    LayoutEditorComponent,
    LayoutModalComponent,
    DeleteLayoutModalComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    LayoutModalComponent,
    DeleteLayoutModalComponent
  ]
})
export class LayoutEditorModule { }
