import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { SidebarComponent } from './sidebar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { TecladoComponent } from '../teclado/teclado.component';

const routes: Routes = [{
  path: '',
  component: SidebarComponent,
  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'teclado',
      component: TecladoComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SidebarRoutingModule {
}
