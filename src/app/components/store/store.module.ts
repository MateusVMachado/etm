import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { TecladoCompartilhadoService } from '../shared/services/teclado_compartilhado.service';
import { StoreItemComponent } from '../storeItem/storeItem.component';
import { TecladoBaseModule } from '../teclado-base/teclado-base.module';
import { StoreComponent } from './store.component';
import { storeRoute } from './store.routing';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TecladoBaseModule,
        NgxPaginationModule,
        RouterModule.forChild(storeRoute)        
    ],
    declarations: [
        StoreComponent,
        StoreItemComponent,
    ],
    exports: [
        StoreComponent
    ],
    providers: [TecladoCompartilhadoService],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class StoreModule { }
