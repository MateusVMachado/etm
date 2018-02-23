import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    
    constructor(private modalService: NgbModal) { }
    
    ngOnInit() {
        
    }

    public showLargeModal() {
        const activeModal = this.modalService.open(ProfileEditComponent, { size: 'lg', container: 'nb-layout' });
    }

}