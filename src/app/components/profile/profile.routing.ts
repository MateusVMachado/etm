import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile.component';

export const routes: Routes = [
    {
        path: '',  component: ProfileComponent,
        children: [{
            path: 'perfil',
            component: ProfileComponent,
        },
        {
            path: '',
            redirectTo: 'perfil',
            pathMatch: 'full',
        }],
    }
];
