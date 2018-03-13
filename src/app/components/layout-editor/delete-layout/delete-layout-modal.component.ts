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
                this.messageService.success("O teclado foi removido.");
                this.sideBarService.emitSideBarCommand('reload');
                this.closeModal();
            }
        });
    }

    private loadSidebarKeyboardNames(){

      }


    public saveKeyboardName(){
        this.layoutEditorService.emitLayoutEditor(this.keyboardName);
        this.closeModal();
    }

    public closeModal() {
        this.activeModal.close();
    }
    
}