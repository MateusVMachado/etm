import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatSlideToggleModule, MatSliderModule, MatToolbarModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import { ThemeModule } from '../../theme.module';
import { TecladoCompartilhadoService } from '../shared/services/teclado_compartilhado.service';
import { CaptionTextModalComponent } from './caption-text/caption-text-modal.component';
import { CaptionTextService } from './caption-text/caption-text.service';
import { DeleteLayoutModalComponent } from './delete-layout/delete-layout-modal.component';
import { LayoutEditorComponent } from './layout-editor.component';
import { routes } from './layout-editor.routing';
import { LayoutEditorService } from './layout-editor.service';
import { LayoutModalComponent } from './layout-modal/layout-modal.component';
import { SaveModalComponent } from './save-layout/save-modal.component';


@NgModule({
  imports: [
    ThemeModule,
    DragulaModule,
    RouterModule.forChild(routes),
    MatSlideToggleModule,
    MatSliderModule,
    MatToolbarModule
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
    LayoutEditorService,
    TecladoCompartilhadoService
  ]
})
export class LayoutEditorModule { }
