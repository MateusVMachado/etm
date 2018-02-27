import { NbUser } from '@nebular/auth/models/user';
import { Picture } from '../../shared/models/picture';
import { ProfileService } from '../profile.service';
import { FileUploaderOptions } from 'ng2-file-upload/file-upload/file-uploader.class';
import { AuthService } from '../../shared/services/auth.services';
import { User } from '../../shared/models/user';
import { JWTtoken } from '../../../storage';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploader, FileSelectDirective } from 'ng2-file-upload';
import 'rxjs/add/operator/map';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
    private readonly base64Token = ';base64,';
    public bigImage: boolean;
    user: any = {}
    saved: boolean;
    public imageFile: Picture;
    public fileLoaded: Boolean = false;
    constructor(private activeModal: NgbActiveModal, 
                private modalService: NgbModal,
                private authService: AuthService,
                private profileService: ProfileService
                ) { }
    
    ngOnInit() {
        this.imageFile = new Picture();
        this.saved = false;
        this.bigImage = false;
        this.loadUser();
    }

    public save(){
        let usuario: User = new User();
        usuario = this.authService.getUser();
        usuario.email = this.user.email;
        usuario.fullName = this.user.name;
        if(this.user.password && this.user.confirmPassword){
            usuario.password = this.user.password
        }
        if(this.imageFile){
            usuario.picture = this.imageFile;
        }
        this.closeModal();
        this.profileService.updateUser(usuario).map(()=> {
            console.log("requisição");
            this.authService.setUser(usuario);
            
        }).subscribe();
    }

    public show(): void {
        const activeModal = this.modalService.open(ProfileEditComponent, { size: 'lg', container: 'nb-layout' });
    }

    public closeModal() {
        this.activeModal.close();
    }

    private loadUser(){
        let user: User = new User();
        user = this.authService.getUser();
        this.user.name = user.fullName;
        this.user.email = user.email;
    }

    public onAddPicture(fileInput: any){
        
        if (fileInput.target.files && fileInput.target.files[0] && fileInput.target.files[0].size < 100000) {
            this.bigImage = false;
            var reader = new FileReader();
            reader.onload = () => {
                console.log(fileInput.target.files[0].size)
                this.imageFile.content = reader.result.substring((reader.result.indexOf(this.base64Token) + this.base64Token.length));
                this.imageFile.name = fileInput.target.files[0].name;
                this.fileLoaded = true;
            };
            reader.readAsDataURL(fileInput.target.files[0]);          
        } else {
            this.bigImage = true;
        }
    }

}