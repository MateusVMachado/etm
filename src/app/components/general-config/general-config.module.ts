import { NgModule } from '@angular/core';

//import { ThemeModule } from '../../theme.module';
import { GeneralConfigComponent } from './general-config.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneralConfigService } from './general-config.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    GeneralConfigComponent,
  ],
  exports: [
    GeneralConfigComponent
],
  providers: [
   GeneralConfigService,
  ]
})
export class GeneralConfigModule { }


