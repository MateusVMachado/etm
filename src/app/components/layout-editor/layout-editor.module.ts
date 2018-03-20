import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';
import { LayoutEditorComponent } from './layout-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DragulaModule } from  'ng2-dragula/ng2-dragula';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';
import { DeleteLayoutModalComponent } from './delete-layout/delete-layout-modal.component';
import { SaveModalComponent } from './save-layout/save-modal.component';
import { CaptionTextModalComponent } from './caption-text/caption-text-modal.component';

@NgModule({
  imports: [
    ThemeModule,
    DragulaModule,
  ],
  declarations: [
    LayoutEditorComponent,
    LayoutModalComponent,
    DeleteLayoutModalComponent,
    SaveModalComponent,
    CaptionTextModalComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    LayoutModalComponent,
    DeleteLayoutModalComponent,
    SaveModalComponent,
    CaptionTextModalComponent
  ]
})
export class LayoutEditorModule { }
