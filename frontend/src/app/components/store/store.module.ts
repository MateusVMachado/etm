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
import { StoreSharedModule } from '../store-shared/store-shared.module';


@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    RouterModule.forChild(storeRoute),
    StoreSharedModule      
  ],
  declarations: [
    StoreComponent,
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
