import { AppBaseComponent } from '../../shared/components/app-base.component';
import { Component, Injector, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';

@Component({
    selector: 'app-layout-modal',
    templateUrl: './layout-modal.component.html'
})
export class LayoutModalComponent extends AppBaseComponent implements OnInit {
    public isKeyboardName: boolean = true;
    
    public keyboardName: string;


    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService,
                private injector: Injector) { super(injector) }

    ngOnInit() { 

    }

    public saveKeyboardName(){
        this.layoutEditorService.emitLayoutEditor(this.keyboardName);
        this.closeModal();
    }

    public closeModal() {
        this.activeModal.close();
    }
    
}