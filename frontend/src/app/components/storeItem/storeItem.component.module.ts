import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TecladoBaseModule } from '../teclado-base/teclado-base.module';
import { StoreItemComponent } from './storeItem.component';
import { StoreSharedModule } from '../store-shared/store-shared.module';
@NgModule({
    declarations: [  ],
    imports: [
      StoreSharedModule,
      CommonModule,
    ]
})
export class StoreItemModule {}