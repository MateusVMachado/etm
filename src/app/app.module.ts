import { MatKeyboardModule } from '@ngx-material-keyboard/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ROUTES } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RecuperarSenhaComponent } from './recuperar-senha/recuperar-senha.component';
import { HomeComponent } from './home/home.component';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from '@angular/material/icon';
import { MenuComponent } from './menu/menu.component';
import { MatCommonModule } from "@angular/material/core";
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { TecladoComponent } from './teclado/teclado.component';
import { TeclaComponent } from './teclado/tecla/tecla.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    RecuperarSenhaComponent,
    HomeComponent,
    MenuComponent,
    TecladoComponent,
    TeclaComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(ROUTES),
    BrowserAnimationsModule,
    MatButtonModule,
    MatCommonModule,
    MatIconModule,
    MatKeyboardModule,
    FormsModule,
    ReactiveFormsModule,
    FroalaEditorModule.forRoot(), 
    FroalaViewModule.forRoot()
  ],
  exports: [ ],
  entryComponents: [ ],
  providers: [ ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
