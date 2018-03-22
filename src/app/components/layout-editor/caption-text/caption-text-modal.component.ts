import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';
import { CaptionTextService } from './caption-text.service';
import { Subscription } from 'rxjs';

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
    private captionSubscribe: Subscription;

    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService,
                private captionTextService: CaptionTextService) {
                    

                    this.captionSubscribe = this.captionTextService.subscribeToCaptionTextSubject().subscribe((result)=>{
                        
                        this.buttonCaption = result[0].target.value;
                        this.buttonText = result[1];
                    })

                 }

    ngOnInit() { 

    }

    ngOnDestroy() {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.saveButtonConfiguration(true);
        this.captionSubscribe.unsubscribe();
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