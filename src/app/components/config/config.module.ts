import { ConfigTecladoComponent } from './config.component';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../theme.module';


@NgModule({
  imports: [
    ThemeModule,
  ],
  declarations: [
    ConfigTecladoComponent
  ],
})
export class ConfigTecladoModule { }
