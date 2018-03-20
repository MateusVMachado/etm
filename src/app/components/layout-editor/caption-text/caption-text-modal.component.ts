import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';

@Component({
    selector: 'app-caption-text-modal',
    templateUrl: './caption-text-modal.component.html',
    styleUrls: ['./caption-text-modal.component.css']
})
export class CaptionTextModalComponent implements OnInit {
    public isKeyboardName: boolean = true;
    
    public keyboardName: string;

    public buttonText: string;
    public buttonCaption: string;

    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService) { }

    ngOnInit() { 

    }


    public saveButtonConfiguration(){
        console.log(this.buttonText + " " + this.buttonCaption);
    }

    public saveKeyboardName(){
        this.layoutEditorService.emitLayoutEditor(this.keyboardName);
        this.closeModal();
    }

    public closeModal() {
        this.activeModal.close();
    }
    
}