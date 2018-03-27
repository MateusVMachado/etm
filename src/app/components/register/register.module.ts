import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NbCardModule } from '@nebular/theme';
import { ThemeModule } from '../../theme.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from './register.component';
import { NgModule } from "@angular/core";
import { routes } from "./register.routing";

@NgModule({
  imports: [ 
      //RouterModule.forChild(routes),
      FormsModule,
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      ThemeModule,
      NbCardModule,
      NgbModule
  ],
  declarations: [
      //RegisterComponent
  ]
})
export class RegisterModule {
}