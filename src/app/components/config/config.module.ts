import { FormsModule } from '@angular/forms';
import { ConfigModalComponent } from './config.component';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';

@NgModule({
  imports: [
    FormsModule,
    ThemeModule,
    BootstrapModalModule
  ],
  declarations: [
    ConfigModalComponent
  ],
  entryComponents: [
    ConfigModalComponent
  ],
  providers: []
})
export class ConfigTecladoModule { }
