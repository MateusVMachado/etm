import { TecladoComponent } from '../teclado/teclado.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { SidebarComponent } from './sidebar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { EditorTecladoComponent } from '../editor-teclado/editor-teclado.component';

const routes: Routes = [{
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
      component: EditorTecladoComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SidebarRoutingModule {
}
