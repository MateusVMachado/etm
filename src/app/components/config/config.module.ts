import { ConfigModalComponent } from './configModal/config.modal';
import { ConfigTecladoComponent } from './config.component';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { ConfigService } from "./config.service";


@NgModule({
  imports: [
    ThemeModule,
    BootstrapModalModule
  ],
  declarations: [
    ConfigTecladoComponent,
    ConfigModalComponent
  ],
  entryComponents: [
    ConfigModalComponent
  ],
  providers: [
    ConfigService
  ]
})
export class ConfigTecladoModule { }
