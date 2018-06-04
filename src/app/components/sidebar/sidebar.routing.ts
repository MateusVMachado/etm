import { Routes } from '@angular/router';
import { SidebarComponent } from './sidebar.component';


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
      loadChildren: 'app/components/dashboard/dashboard.module#DashboardModule'
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
    },
    {
      path: 'store',
      loadChildren: 'app/components/store/store.module#StoreModule'
    },
    {
      path: 'store/:id',
      loadChildren: 'app/components/store/store.module#StoreModule'
    }
  ],
}];

