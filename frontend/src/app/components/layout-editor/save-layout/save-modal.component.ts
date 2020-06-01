import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../shared/services/auth.services';
import { MessageService } from '../../shared/services/message.service';
import { TecladoCompartilhadoService } from '../../shared/services/teclado_compartilhado.service';
import { LayoutEditorService } from '../layout-editor.service';
import * as $ from 'jquery';


@Component({
    selector: 'app-save-modal',
    templateUrl: './save-modal.component.html'
})
export class SaveModalComponent implements OnInit {
    constructor(private activeModal: NgbActiveModal,
        private layoutEditorService: LayoutEditorService,
        public messageService : MessageService,
        private authService: AuthService,
        private tecladoCompartilhadoService : TecladoCompartilhadoService) { }
        
        ngOnInit() {
        }
        
        public sendConfirmation(){
            this.layoutEditorService.emitLayoutEditor('confirm');
            this.closeModal();
        }
        
        public sendRefutation(){
            this.layoutEditorService.emitLayoutEditor('refuse');
            this.closeModal();
        }
        
        public closeModal() {
            this.activeModal.close();
        }
        
    }