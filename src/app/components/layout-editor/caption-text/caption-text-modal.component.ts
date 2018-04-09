import { AppBaseComponent } from '../../shared/components/app-base.component';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';
import { CaptionTextService } from './caption-text.service';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';

@Component({
    selector: 'app-caption-text-modal',
    templateUrl: './caption-text-modal.component.html',
    styleUrls: ['./caption-text-modal.component.css']
})
export class CaptionTextModalComponent extends AppBaseComponent implements OnInit, OnDestroy {
    public isKeyboardName: boolean = true;
    public falar: boolean;
    public escrever: boolean;
    public imagem: boolean;
    public keyboardName: string;
    public imgPadrao: string;

    public buttonText: string;
    public buttonCaption: string;
    public buttonAction: string;
    private captionSubscribe: Subscription;

    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService,
                private captionTextService: CaptionTextService,
                private injector: Injector) {
                    super(injector)

                    this.captionSubscribe = this.captionTextService.subscribeToCaptionTextSubject().subscribe((result)=>{
                        
                        this.buttonCaption = result[0].target.value;
                        this.buttonText = result[1];
                        this.buttonAction = result[2];

                        if(this.buttonAction === "Keyboard"){
                            this.escrever = true;
                            this.falar = false;
                        } else if( this.buttonAction === "TTS"){
                            this.escrever = false;
                            this.falar = true;
                        }

                    })

                 }


    ngOnInit() { 
        this.imgPadrao = '1';
    }

    ngOnDestroy() {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.saveButtonConfiguration(true);
        this.captionSubscribe.unsubscribe();
    }

    public onChangeToggle(event){
        if(event['source'].id === 'escrever' && event['source'].checked === false && !this.falar){
            event['source'].checked = true;
            this.escrever = true;     
        }
        if(!this.falar && !this.escrever){
            this.escrever = true;
        }
    }

    public saveButtonConfiguration(stat?){
        let payload = new Array();    
        payload.push(this.buttonText);
        payload.push(this.buttonCaption);

        if(this.falar && !this.escrever) this.buttonAction = 'TTS'; // falar activated
        if(!this.falar && this.escrever) this.buttonAction = 'Keyboard'; // escrever activated
        //if(this.falar && this.escrever) this.buttonAction = 'KeyboardAndTTS'; // both
        if(!this.falar && !this.escrever) this.buttonAction = 'Keyboard'; // None activated
        payload.push(this.buttonAction);

        
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

    slideImage(direction: string){
        let image: number;
        if(direction === 'up'){
            if(this.imgPadrao === '1'){
                image = 14;
            }else{
                image = Number(this.imgPadrao) - 1;
            }
            this.imgPadrao = String(image);
        }else if(direction === 'down'){
            if(this.imgPadrao === '14'){
                image = 1;
            }else{
                image = Number(this.imgPadrao) + 1;
            }
            this.imgPadrao = String(image);
        }
        
    }
    
}