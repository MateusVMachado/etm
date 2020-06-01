import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProfileComponent } from "./profile.component";
import { routes } from "./profile.routing";
import { ProfileService } from './profile.service';

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
        ProfileService,
        NgbModal        
    ],
    schemas: [ 
        CUSTOM_ELEMENTS_SCHEMA 
    ], 
    entryComponents: [
        ProfileEditComponent
    ]
})
export class ProfileModule {}