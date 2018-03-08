import { ProfileService } from './profile.service';
import { ProfileEditModule } from './profile-edit/profile-edit.module';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from "./profile.component";

@NgModule({
    declarations: [
        ProfileComponent
    ],
    imports: [ 
        CommonModule,
        FormsModule,
        ProfileEditModule
    ],
    providers: [
        ProfileService
    ],
    schemas: [ 
        CUSTOM_ELEMENTS_SCHEMA 
    ]
})
export class ProfileModule {}