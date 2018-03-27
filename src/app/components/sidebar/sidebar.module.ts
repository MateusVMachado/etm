import { RouterModule } from '@angular/router';
import { TecladoService } from '../teclado/teclado.service';
import { SideBarService } from './sidebar.service';
import { EditorTecladoService } from '../editor-teclado/editor-teclado.service';
import { ProfileModule } from '../profile/profile.module';
import { NgModule } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ThemeModule } from '../../theme.module';
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
