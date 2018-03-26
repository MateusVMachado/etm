import { Component, OnInit, Injector } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';
import { AuthService } from '../../shared/services/auth.services';
import { SideBarService } from '../../sidebar/sidebar.service';
import { KeyboardNamesList } from '../../sidebar/keyboards-list.model';
import { AppBaseComponent } from '../../shared/components/app-base.component';

@Component({
    selector: 'app-delete-layout-modal',
    templateUrl: './delete-layout-modal.component.html'
})
export class DeleteLayoutModalComponent extends AppBaseComponent implements OnInit {
    public isKeyboardName: boolean = true;
    
    public keyboardName: string;
    public keyboardToDelete: string;
    public keyboardItems: KeyboardNamesList = new KeyboardNamesList();

    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService,
                private authService: AuthService,
                private sideBarService: SideBarService,
                protected injector: Injector) { 
                    super(injector)

                    let user = this.authService.getLocalUser();
                    this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
                        this.keyboardItems = result;
                    });
 

                }

    ngOnInit() { 

    }

    public deleteKeyboardOnBack(){
        let user = this.authService.getLocalUser();
        this.layoutEditorService.deleteKeyboard(this.keyboardToDelete, user.email).subscribe((result)=>{
            if(result === 'removed'){
                let message = this.messageService.getTranslation('MENSAGEM_TECLADO_REMOVIDO');
                this.messageService.success(message);
                this.sideBarService.emitSideBarCommand('reload');

                let user = this.authService.getLocalUser();
                this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
                    this.keyboardItems = result;
                });
                this.closeModal();

                this.keyboardItems.KeyboardsNames = this.keyboardItems.KeyboardsNames.filter(item => item !== this.keyboardToDelete);
   
            }
        });

        
    }

    private loadSidebarKeyboardNames(){}


    public saveKeyboardName(){
        this.layoutEditorService.emitLayoutEditor(this.keyboardName);
        this.closeModal();
    }

    public closeModal() {
        this.activeModal.close();
    }
    
}