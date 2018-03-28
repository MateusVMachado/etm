import { ProfileComponent } from './components/profile/profile.component';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NbAuthComponent,
  NbLoginComponent,
  NbLogoutComponent,
  NbRegisterComponent,
  NbResetPasswordComponent,
} from '@nebular/auth';
import { AuthGuard } from './guards/auth-guard.service';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { RequestPasswordComponent } from './components/request-password/request-password.component';
import { GeneralConfigComponent } from './components/general-config/general-config.component';

const routes: Routes = [
  {
    path: 'pages',
    canActivate: [AuthGuard],
    loadChildren: 'app/components/sidebar/sidebar.module#SidebarModule' 
  },
  {
    path: 'auth',
    component: NbAuthComponent,
    children: [
      {
        path: '',
        loadChildren: 'app/components/login/login.module#LoginModule',
      },
      {
        path: 'login',
        loadChildren: 'app/components/login/login.module#LoginModule',
      },
      {
        path: 'register',
        loadChildren: 'app/components/register/register.module#RegisterModule'
      },
      {
        path: 'request-password',
        loadChildren: 'app/components/request-password/request-password.module#RequestPasswordModule'
      }
    ],
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages' },
];

const config: ExtraOptions = {
  useHash: true,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
