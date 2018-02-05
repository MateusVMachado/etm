import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { TecladoComponent } from './teclado.component';

const routes: Routes = [
    {  
        path: 'pages/teclado',  component: TecladoComponent,  
        children: [{
            path: 'teclado',
            component: TecladoComponent,
        },
        {
            path: '',
            redirectTo: 'teclado',
            pathMatch: 'full',
        }],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecladoRoutingModule {
}
