import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RegisterComponent } from './register.component';

export const routes: Routes = [
    {
        path: '',  component: RegisterComponent
    }
];
