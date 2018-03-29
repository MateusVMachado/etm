import { ThemeModule } from '../../theme.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from './register.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { routes } from "./register.routing";

@NgModule({
  imports: [ 
      RouterModule.forChild(routes),
      FormsModule,
      HttpClientModule,
      ThemeModule
  ],
  declarations: [
      RegisterComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class RegisterModule {
}