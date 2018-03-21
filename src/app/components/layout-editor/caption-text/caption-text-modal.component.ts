import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';

@Component({
    selector: 'app-caption-text-modal',
    templateUrl: './caption-text-modal.component.html',
    styleUrls: ['./caption-text-modal.component.css']
})
export class CaptionTextModalComponent implements OnInit, OnDestroy {
    public isKeyboardName: boolean = true;
    
    public keyboardName: string;

    public buttonText: string;
    public buttonCaption: string;
    

    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService) { }

    ngOnInit() { 

    }

    ngOnDestroy() {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        console.log("DESTROYED");
        this.saveButtonConfiguration(true);
    }

    public saveButtonConfiguration(stat?){
        let payload = new Array();    
        payload.push(this.buttonText);
        payload.push(this.buttonCaption);

        
        this.layoutEditorService.emitLayoutEditorPayload(payload);        
        if(stat){
            return;
        } else {
            this.closeModal();
        }
        
    }

    public saveKeyboardName(){
        this.layoutEditorService.emitLayoutEditor(this.keyboardName);
        this.closeModal();
    }

    public closeModal(stat?) {
        this.saveButtonConfiguration(true)
        this.activeModal.close();
    }
    
}