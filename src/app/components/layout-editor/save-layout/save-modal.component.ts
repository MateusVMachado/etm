import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';


@Component({
    selector: 'app-save-modal',
    templateUrl: './save-modal.component.html'
})
export class SaveModalComponent implements OnInit {
    public isKeyboardName: boolean = true;
    
    public keyboardName: string;


    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService) { }

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