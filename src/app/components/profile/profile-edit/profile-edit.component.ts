import { ProfileService } from '../profile.service';
import { FileUploaderOptions } from 'ng2-file-upload/file-upload/file-uploader.class';
import { AuthService } from '../../shared/services/auth.services';
import { User } from '../../shared/models/user';
import { JWTtoken } from '../../../storage';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
    URL = 'http://localhost:8080/user'
    public uploader: FileUploader = new FileUploader({url: this.URL});
    user: any = {}
    saved: boolean;
    public selectedFiles;
    constructor(private activeModal: NgbActiveModal, 
                private modalService: NgbModal,
                private authService: AuthService,
                private profileService: ProfileService
                ) { }
    
    ngOnInit() {
        this.uploader.options.method = 'put';
        this.uploader.options.autoUpload = true;
        this.uploader.options.authToken = 'Bearer ' + JWTtoken.token;
        this.saved = false
        this.loadUser();
    }

    public save(){
        let user: User = new User();
        user = this.authService.getUser();
        user.email = this.user.email;
        user.fullName = this.user.name;
        this.profileService.updateUser(user).subscribe();
        this.closeModal();
    }

    public show(): void {
        const activeModal = this.modalService.open(ProfileEditComponent, { size: 'lg', container: 'nb-layout' });
    }

    public closeModal() {
        this.activeModal.close();
    }

    loadUser(){
        let user: User = new User();
        user = this.authService.getUser();
        this.user.name = user.fullName;
        this.user.email = user.email;
    }

    getConfigValue() { }

}