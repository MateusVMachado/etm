import { LoginComponent } from './login.component';
import { ThemeModule } from '../../theme.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { routes } from "./login.routing";


@NgModule({
  imports: [ 
      RouterModule.forChild(routes),
      FormsModule,
      HttpClientModule,
      ThemeModule
  ],
  declarations: [
      LoginComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LoginModule {
}