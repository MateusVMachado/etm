import { NgModule } from '@angular/core';

//import { ThemeModule } from '../../theme.module';
import { GeneralConfigComponent } from './general-config.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneralConfigService } from './general-config.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSliderModule } from '@angular/material';
import { MatToolbarModule } from '@angular/material';
import { MatSlideToggleModule } from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatToolbarModule,
    MatSlideToggleModule
  ],
  declarations: [
    GeneralConfigComponent,
  ],
  exports: [
    GeneralConfigComponent
],
schemas: [
  CUSTOM_ELEMENTS_SCHEMA
]
})
export class GeneralConfigModule { }


