import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LayoutEditorComponent } from './layout-editor.component';

export const routes: Routes = [
    {
        path: '',  component: LayoutEditorComponent,
        children: [{
            path: 'layout-editor',
            component: LayoutEditorComponent,
        },
        {
            path: '',
            redirectTo: 'layout-editor',
            pathMatch: 'full',
        }],
    }
];
