import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { isNullOrUndefined } from 'util';
import { AppBaseComponent } from '../../shared/components/app-base.component';
import { AuthService } from '../../shared/services/auth.services';
import { TecladoCompartilhadoService } from '../../shared/services/teclado_compartilhado.service';
import { KeyboardNamesList } from '../../sidebar/keyboards-list.model';
import { SideBarService } from '../../sidebar/sidebar.service';
import { LayoutEditorService } from '../layout-editor.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-delete-layout-modal',
    templateUrl: './delete-layout-modal.component.html'
})
export class DeleteLayoutModalComponent extends AppBaseComponent implements OnDestroy {
    public isKeyboardName: boolean = true;
    
    public keyboardName: string;
    public keyboardToDelete: string;
    public keyboardItems: KeyboardNamesList = new KeyboardNamesList();
    private loadKeyboardsNamesSubscription : Subscription
    private deleteKeyboardSubscription : Subscription
    private tecladoCompartilhadoRemoveSubscription : Subscription
    
    constructor(private activeModal: NgbActiveModal,
        private layoutEditorService: LayoutEditorService,
        private authService: AuthService,
        private sideBarService: SideBarService,
        private tecladoCompartilhadoService : TecladoCompartilhadoService,
        protected injector: Injector) { 
            super(injector)

            let user = this.authService.getLocalUser();
            this.loadKeyboardsNamesSubscription = this.sideBarService.loadKeyboardsNames(user.email).subscribe((result) => {
                this.keyboardItems = result;
            });
        }
        
        ngOnDestroy(){
            if(this.loadKeyboardsNamesSubscription) this.loadKeyboardsNamesSubscription.unsubscribe();
            if(this.deleteKeyboardSubscription) this.deleteKeyboardSubscription.unsubscribe();
            if(this.tecladoCompartilhadoRemoveSubscription) this.tecladoCompartilhadoRemoveSubscription.unsubscribe();
        }
        
        public deleteKeyboardOnBack(){
            if( !isNullOrUndefined(this.keyboardToDelete) ){
                let user = this.authService.getLocalUser();
                this.deleteKeyboardSubscription = this.layoutEditorService.deleteKeyboard(this.keyboardToDelete, user.email).subscribe((result)=>{
                    
                    if(result === 'removed'){
                        this.tecladoCompartilhadoRemoveSubscription = this.tecladoCompartilhadoService.removeTeclado(user.email,this.keyboardToDelete).subscribe(()=>{
                            let message = this.messageService.getTranslation('MENSAGEM_TECLADO_REMOVIDO');
                            this.messageService.success(message);
                            this.sideBarService.emitSideBarCommand('reload');
                            this.closeModal();
                        });
                        
                        this.loadKeyboardsNamesSubscription = this.sideBarService.loadKeyboardsNames(this.authService.getLocalUser().email).subscribe((result) => {
                            this.keyboardItems = result;
                        });
                        
                        this.keyboardItems.KeyboardsNames = this.keyboardItems.KeyboardsNames.filter(item => item !== this.keyboardToDelete);
                        
                    }
                });
            }
        }
        
        public closeModal() {
            this.activeModal.close();
        }
        
    }