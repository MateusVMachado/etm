/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './core.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeModule } from './theme.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StateService } from './data/state.service';
import { AuthGuard } from './guards/auth-guard.service';
import { NgxRegisterComponent } from './components/register/register.component';
import { AuthService } from './components/shared/auth.services';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    ThemeModule.forRoot(),
    CoreModule.forRoot(),
    SweetAlert2Module.forRoot({
        buttonsStyling: false,
        customClass: 'modal-content',
        confirmButtonClass: 'btn btn-success',
    })
  ],
  bootstrap: [AppComponent],
  providers: [
    CookieService,
    StateService,
    AuthService,
    AuthGuard,
    { provide: APP_BASE_HREF, useValue: '/' }
  ],
})
export class AppModule {
}
