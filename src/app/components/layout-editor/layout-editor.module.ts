import { LayoutEditorService } from './layout-editor.service';
import { CaptionTextService } from './caption-text/caption-text.service';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';
import { LayoutEditorComponent } from './layout-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DragulaModule } from  'ng2-dragula/ng2-dragula';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';
import { DeleteLayoutModalComponent } from './delete-layout/delete-layout-modal.component';
import { SaveModalComponent } from './save-layout/save-modal.component';
import { CaptionTextModalComponent } from './caption-text/caption-text-modal.component';
import { routes } from "./layout-editor.routing";

@NgModule({
  imports: [
    ThemeModule,
    DragulaModule,
    RouterModule.forChild(routes)
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
  ],
  providers: [
    CaptionTextService,
    LayoutEditorService
  ]
})
export class LayoutEditorModule { }
