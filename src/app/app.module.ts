//import { ConfigTecladoModule } from './components/config/config.module';
import { InterceptorService } from './components/shared/services/interceptor.service';
import { ProfileService } from './components/profile/profile.service';
import { ProfileModule } from './components/profile/profile.module';
import { MessageService } from './components/shared/services/message.service';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CoreModule } from './nebular-core.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeModule } from './theme.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StateService } from './data/state.service';
import { AuthGuard } from './guards/auth-guard.service';
import { NgxRegisterComponent } from './components/register/register.component';
import { AuthService } from './components/shared/services/auth.services';
import { CookieService } from 'ngx-cookie-service';
import { CKEditorComponent } from 'ng2-ckeditor';
import { SideBarService } from './components/sidebar/sidebar.service';
import { FormsModule } from '@angular/forms';
import { GeneralConfigService } from './components/general-config/general-config.service';
import { DragulaModule, DragulaService } from  'ng2-dragula/ng2-dragula';
import { LayoutEditorService } from './components/layout-editor/layout-editor.service';

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
    FormsModule,
    DragulaModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    CookieService,
    StateService,
    AuthService,
    AuthGuard,
    MessageService,
    CKEditorComponent,
    SideBarService,
    GeneralConfigService,
    LayoutEditorService,
    ProfileService,
    { provide: APP_BASE_HREF, useValue: '/' }
  ],
})
export class AppModule {
}
