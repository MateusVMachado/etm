import { Routes } from '@angular/router';
import { StoreComponent } from './store.component';

export const storeRoute: Routes = [
    {path: '',  component: StoreComponent},
    {path: 'pages/store/:id',  component: StoreComponent}
]; 

export class StoreRoutingModule {
}
