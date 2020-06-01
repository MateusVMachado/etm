import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule, MatSliderModule, MatToolbarModule } from '@angular/material';
import { RouterModule } from '@angular/router';
//import { ThemeModule } from '../../theme.module';
import { GeneralConfigComponent } from './general-config.component';
import { routes } from "./general-config.routing";



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatToolbarModule,
    MatSlideToggleModule,
    FormsModule,
    RouterModule.forChild(routes)
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


