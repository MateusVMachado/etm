import { Routes } from '@angular/router';
import { RequestPasswordComponent } from './request-password.component';

export const routes: Routes = [
    {
        path: '',  component: RequestPasswordComponent
    },
    {path: '/:email',  component: RequestPasswordComponent}
];
