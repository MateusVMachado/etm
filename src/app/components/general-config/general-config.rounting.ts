import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { GeneralConfigComponent } from './general-config.component';

const routes: Routes = [
    {
        path: '',  component: GeneralConfigComponent,
        children: [{
            path: 'general-config',
            component: GeneralConfigComponent,
        },
        {
            path: '',
            redirectTo: 'general-config',
            pathMatch: 'full',
        }],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralConfigRoutingModule {
}
