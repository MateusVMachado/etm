import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeModule } from '../../theme.module';
import { ProfileService } from '../profile/profile.service';
import { RequestPasswordComponent } from './request-password.component';
import { routes } from "./request-password.routing";


@NgModule({
  imports: [ 
      RouterModule.forChild(routes),
      FormsModule,
      HttpClientModule,
      ThemeModule
  ],
  declarations: [
      RequestPasswordComponent
  ],
  providers: [ProfileService],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class RequestPasswordModule {
}