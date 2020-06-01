import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';

export const routes: Routes = [
    {
        path: '',  component: DashboardComponent
    }
];
