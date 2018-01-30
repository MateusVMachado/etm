import { TecladoComponent } from './teclado/teclado.component';
import { HomeComponent } from './home/home.component';
import { RecuperarSenhaComponent } from './recuperar-senha/recuperar-senha.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LoginComponent } from './login/login.component';
import { Routes } from '@angular/router';
import { AppComponent } from "./app.component";

export const ROUTES: Routes = [
    {path: '', component: LoginComponent},
    {path: 'sign-up', component: SignUpComponent},
    {path: 'recuperar-senha', component: RecuperarSenhaComponent},
    {path: 'myKeyboard', component: HomeComponent},
    {path: 'teclado', component: TecladoComponent}
];