import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    user: User;
    constructor(private modalService: NgbModal, private authService: AuthService) { }
    
    ngOnInit() {
        this.user = new User();
        this.user = this.authService.getLocalUser();
    }

    public showLargeModal() {
        const activeModal = this.modalService.open(ProfileEditComponent, { size: 'lg', container: 'nb-layout' });
    }

}