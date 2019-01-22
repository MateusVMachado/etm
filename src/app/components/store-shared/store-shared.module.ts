import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreItemComponent } from '../storeItem/storeItem.component';
import { AppModule } from '../../app.module';
import { TecladoBaseModule } from '../teclado-base/teclado-base.module';

@NgModule({
  declarations: [ StoreItemComponent ],
  imports: [AppModule, CommonModule, TecladoBaseModule],
  exports: [ StoreItemComponent ],
})
export class StoreSharedModule { }
