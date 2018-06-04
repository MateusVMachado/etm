import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TecladoBaseModule } from '../teclado-base/teclado-base.module';
import { StoreItemComponent } from './storeItem.component';
@NgModule({
    declarations: [ StoreItemComponent ],
    imports: [ 
        CommonModule,
        TecladoBaseModule
    ]
})
export class StoreItemModule {}