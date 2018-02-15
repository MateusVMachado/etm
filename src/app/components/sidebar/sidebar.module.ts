import { NgModule } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { SidebarRoutingModule } from './sidebar.routing';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ThemeModule } from '../../theme.module';
import { TecladoModule } from '../teclado/teclado.module';
import { ConfigTecladoModule } from '../config/config.module';

const PAGES_COMPONENTS = [
  SidebarComponent,
];

@NgModule({
  imports: [
    SidebarRoutingModule,
    ThemeModule,
    DashboardModule,
    TecladoModule,
    ConfigTecladoModule
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
})
export class SidebarModule {
}
