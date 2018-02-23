import { HttpModule } from '@angular/http';
import { ProfileEditComponent } from './profile-edit.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { FormsModule } from '@angular/forms';
import { Angular2TokenService } from "angular2-token/angular2-token";
import { FileUploadModule } from "ng2-file-upload";

@NgModule({
    declarations: [
        ProfileEditComponent
    ],
    imports: [ 
        CommonModule, 
        BootstrapModalModule,
        FormsModule,
        HttpModule,
        FileUploadModule
    ],
    exports: [],
    providers: [
        Angular2TokenService
    ],
    entryComponents: [
        ProfileEditComponent
    ]
})
export class ProfileEditModule {}