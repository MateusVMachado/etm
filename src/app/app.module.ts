import { InterceptorService } from './components/shared/services/interceptor.service';
import { HeaderService } from './components/header/header.service';
import { MessageService } from './components/shared/services/message.service';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './nebular-core.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeModule } from './theme.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StateService } from './data/state.service';
import { AuthGuard } from './guards/auth-guard.service';
import { AuthService } from './components/shared/services/auth.services';
import { CKEditorComponent } from 'ng2-ckeditor';
import { SideBarService } from './components/sidebar/sidebar.service';
import { FormsModule } from '@angular/forms';
import { GeneralConfigService } from './components/general-config/general-config.service';
import { DragulaModule, DragulaService } from  'ng2-dragula/ng2-dragula';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { CaptionTextService } from './components/layout-editor/caption-text/caption-text.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

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
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (HttpLoaderFactory),
          deps: [HttpClient]
      }
  })
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    StateService,
    AuthService,
    AuthGuard,
    MessageService,
    CKEditorComponent,
    SideBarService,
    HeaderService,
    GeneralConfigService,
    { provide: APP_BASE_HREF, useValue: '/' }
  ]
})
export class AppModule {
}
