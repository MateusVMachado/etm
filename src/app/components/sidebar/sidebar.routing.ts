import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { SidebarComponent } from './sidebar.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

const routes: Routes = [{
  path: '',
  component: SidebarComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SidebarRoutingModule {
}
