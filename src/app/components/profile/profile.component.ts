import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AppBaseComponent } from '../shared/components/app-base.component';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { ProfileService } from './profile.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent extends AppBaseComponent implements OnInit {
    usuario: User;
    user: any = {};
    imgUrl: any;
    constructor(private modalService: NgbModal, 
                private authService: AuthService, 
                private profileService: ProfileService,
                private router: Router,
                private injector: Injector) { 
                    super(injector)
                }
    
    ngOnInit() {
        this.usuario = this.authService.getLocalUser();
        this.user.name = this.usuario.fullName;
        this.user.email = this.usuario.email;
        this.user.password = '';
        this.user.confirmPassword = '';
        this.authService.getObservableUser().subscribe(result =>{
            this.usuario = result;
            if(result.picture.content){
                this.imgUrl = 'data:image/png;base64,'+ result.picture.content;
            }else{
                this.imgUrl = '../../../assets/images/avatarUser.png'
            }
        });
    }

    public showLargeModal() {
        const activeModal = this.modalService.open(ProfileEditComponent, { size: 'lg', container: 'nb-layout' });
    }

    public save(){
        this.usuario = this.authService.getLocalUser();
        this.usuario.fullName = this.user.name;
        if(this.user.password && this.user.confirmPassword){
            if(this.user.password != ''){
                this.usuario.password = this.user.password
            }
        }
        this.profileService.updateUser(this.usuario).subscribe(() =>{
            this.authService.setUser(this.usuario);
        });
    }
}