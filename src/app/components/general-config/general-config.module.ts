import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

//import { ThemeModule } from '../../theme.module';
import { GeneralConfigComponent } from './general-config.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneralConfigService } from './general-config.service';
import { routes } from "./general-config.routing";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    GeneralConfigComponent,
  ],
  exports: [
    GeneralConfigComponent
  ],
  providers: [
    //GeneralConfigService
  ]
})
export class GeneralConfigModule { }


