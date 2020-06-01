import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { ThemeModule } from '../../theme.module';
import { DashboardComponent } from './dashboard.component';


@NgModule({
  imports: [
    ThemeModule
  ],
  declarations: [
    DashboardComponent,
  ],
})
export class DashboardModule { }
