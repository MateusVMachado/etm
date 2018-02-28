import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { ProfileEditComponent } from './profile-edit.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        ProfileEditComponent
    ],
    imports: [ 
        CommonModule, 
        BootstrapModalModule,
        FormsModule,
        HttpModule,
        HttpClientModule
    ],
    exports: [],
    providers: [
    ],
    entryComponents: [
        ProfileEditComponent
    ]
})
export class ProfileEditModule {}