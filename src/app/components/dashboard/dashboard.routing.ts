import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
    {  
        path: '',  component: DashboardComponent,  
        children: [{
            path: 'dashboard',
            component: DashboardComponent,
        },
        {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
        }],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {
}
