import { ConfigModalComponent } from './config.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
        path: '',  component: ConfigModalComponent,
        children: [{
            path: 'config',
            component: ConfigModalComponent,
        },
        {
            path: '',
            redirectTo: 'config',
            pathMatch: 'full',
        }],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigTecladoRoutingModule {
}
