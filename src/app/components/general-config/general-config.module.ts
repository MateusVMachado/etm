import { NgModule } from '@angular/core';

//import { ThemeModule } from '../../theme.module';
import { GeneralConfigComponent } from './general-config.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


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
})
export class GeneralConfigModule { }


