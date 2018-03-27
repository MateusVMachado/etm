import { ProfileComponent } from '../profile/profile.component';
import { TecladoComponent } from '../teclado/teclado.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { SidebarComponent } from './sidebar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EditorTecladoComponent } from '../editor-teclado/editor-teclado.component';
import { GeneralConfigComponent } from '../general-config/general-config.component';
import { LayoutEditorComponent } from '../layout-editor/layout-editor.component';

export const routes: Routes = [{
  path: '',
  component: SidebarComponent,
  children: [
    {
      path: '',
      redirectTo: 'editor-teclado',
      pathMatch: 'full',
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'editor-teclado',
      loadChildren: 'app/components/editor-teclado/editor-teclado.module#EditorTecladoModule'
    },
    {
      path: 'general-config',
      loadChildren: 'app/components/general-config/general-config.module#GeneralConfigModule'
    },
    {
      path: 'layout-editor',
      loadChildren: 'app/components/layout-editor/layout-editor.module#LayoutEditorModule'
    },
    {
      path: 'profile',
      loadChildren: 'app/components/profile/profile.module#ProfileModule'
    }
  ],
}];

