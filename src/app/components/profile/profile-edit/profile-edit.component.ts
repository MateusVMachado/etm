import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/map';
import { AppBaseComponent } from '../../shared/components/app-base.component';
import { Picture } from '../../shared/models/picture';
import { User } from '../../shared/models/user';
import { AuthService } from '../../shared/services/auth.services';
import { ProfileService } from '../profile.service';


@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent extends AppBaseComponent implements OnInit, OnDestroy {
    private readonly base64Token = ';base64,';
    public bigImage: boolean;
    user: any = {}
    saved: boolean;
    public imageFile: Picture;
    public fileLoaded: Boolean = false;
    private updateUserSubscription : Subscription;
    constructor(private activeModal: NgbActiveModal, 
        private modalService: NgbModal,
        private authService: AuthService,
        private profileService: ProfileService,
        private injector: Injector
    ) { super(injector) }
    
    ngOnInit() {
        this.imageFile = new Picture();
        this.saved = false;
        this.bigImage = false;
    }
    ngOnDestroy(){
        if(this.updateUserSubscription) this.updateUserSubscription.unsubscribe();
    }
    
    public save(){
        let usuario: User = new User();
        usuario = this.authService.getLocalUser();
        if(this.imageFile.content){
            usuario.picture = this.imageFile;
        }
        this.closeModal();
        let message;
        this.updateUserSubscription = this.profileService.updateUser(usuario).subscribe(() =>{
            this.authService.setUser(usuario);
            message = this.messageService.getTranslation('MENSAGEM_CONFIGURACOES_SALVAS');
            this.messageService.success(message);
        });
    }
    
    public show(): void {
        const activeModal = this.modalService.open(ProfileEditComponent, { size: 'lg', container: 'nb-layout' });
    }
    
    public closeModal() {
        this.activeModal.close();
    }
    
    public onAddPicture(fileInput: any){
        
        if (fileInput.target.files && fileInput.target.files[0] && fileInput.target.files[0].size < 500000) {
            this.bigImage = false;
            var reader = new FileReader();
            reader.onload = () => {                
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