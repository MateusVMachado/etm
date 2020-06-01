import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeModule } from '../../theme.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import { TecladoService } from '../teclado/teclado.service';
import { SidebarComponent } from './sidebar.component';
import { routes } from "./sidebar.routing";

const PAGES_COMPONENTS = [
  SidebarComponent,
];

@NgModule({
  imports: [
    ThemeModule,
    DashboardModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
  providers: [
    TecladoService,
    EditorTecladoService
  ]
})
export class SidebarModule {
}
