import { JWTtoken } from '../../../storage';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload';
const URL = 'http://localhost:8080/';
@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
    public uploader: FileUploader = new FileUploader({url: URL, authToken: JWTtoken.token});
    user = {}
    saved: boolean;
    public selectedFiles;
    constructor(private activeModal: NgbActiveModal, 
                private modalService: NgbModal
                ) { }
    
    ngOnInit() {
        this.saved = false
    }

    public save(){
        console.log(this.user);
        this.closeModal();
    }

    public show(): void {
        const activeModal = this.modalService.open(ProfileEditComponent, { size: 'lg', container: 'nb-layout' });
    }

    public closeModal() {
        this.activeModal.close();
    }

    getConfigValue() { }

}