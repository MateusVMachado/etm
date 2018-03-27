import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { RouterModule } from '@angular/router';
import { ProfileService } from './profile.service';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from "./profile.component";
import { routes } from "./profile.routing";

@NgModule({
    declarations: [
        ProfileComponent,
        ProfileEditComponent
    ],
    imports: [ 
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        BootstrapModalModule
    ],
    providers: [
        ProfileService
    ],
    schemas: [ 
        CUSTOM_ELEMENTS_SCHEMA 
    ], 
    entryComponents: [
        ProfileEditComponent
    ]
})
export class ProfileModule {}