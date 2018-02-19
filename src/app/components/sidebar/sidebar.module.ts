import { NgModule } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { SidebarRoutingModule } from './sidebar.routing';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ThemeModule } from '../../theme.module';
import { EditorTecladoModule } from '../editor-teclado/editor-teclado.module';

const PAGES_COMPONENTS = [
  SidebarComponent,
];

@NgModule({
  imports: [
    SidebarRoutingModule,
    ThemeModule,
    DashboardModule,
    EditorTecladoModule
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
})
export class SidebarModule {
}
