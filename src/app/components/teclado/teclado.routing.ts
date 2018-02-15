import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { TecladoComponent } from './teclado.component';

const routes: Routes = [
    {
        path: '/pages/teclado',  component: TecladoComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TecladoRoutingModule {
}
