import { AppBaseComponent } from '../../shared/components/app-base.component';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';
import { CaptionTextService } from './caption-text.service';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { Picture } from '../../shared/models/picture';

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

    public buttonText: string = "";
    public buttonCaption: string = "";
    public buttonAction: string = "";
    public buttonImage: string = "";

    private captionSubscribe: Subscription;

    private readonly base64Token = ';base64,';
    public bigImage: boolean;
    public imageFile: Picture;
    public fileLoaded: Boolean = false;
    public saved: boolean;

    public imgUrl: string;
    public height: number;
    public width: number;

    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService,
                private captionTextService: CaptionTextService,
                private injector: Injector) {
                    super(injector)

                    this.captionSubscribe = this.captionTextService.subscribeToCaptionTextSubject().subscribe((result)=>{
                        
                        if(result[1].substring(0,1) === '*'){
                            this.buttonCaption = "";
                            this.buttonText = "";
                            this.buttonAction = result[2]; 
                        } else {
                            this.buttonCaption = result[0].target.value;
                            this.buttonText = result[1];
                            this.buttonAction = result[2];
                        }
             
                        if(this.buttonAction === "Keyboard"){
                            this.escrever = true;
                            this.falar = false;
                        } else if( this.buttonAction === "TTS"){
                            this.escrever = false;
                            this.falar = true;
                        } else if( this.buttonAction === "KeyboardAndTTS"){
                            this.escrever = true;
                            this.falar = true;
                        } else {
                            this.escrever = true;
                        }

                    })

                 }


    ngOnInit() { 
        this.imageFile = new Picture();
        this.saved = false;
        this.bigImage = false;

        this.imgPadrao = '1';
    }

    ngOnDestroy() {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        //this.saveButtonConfiguration(true);
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
        
        if(this.buttonImage)this.buttonCaption = "*img";

        payload.push(this.buttonText);
        payload.push(this.buttonCaption);
        
    
        if(this.falar && !this.escrever) this.buttonAction = 'TTS'; // falar activated
        if(!this.falar && this.escrever) this.buttonAction = 'Keyboard'; // escrever activated
        if(this.falar && this.escrever) this.buttonAction = 'KeyboardAndTTS'; // both
        if(!this.falar && !this.escrever) this.buttonAction = 'Keyboard'; // None activated
        payload.push(this.buttonAction);

        payload.push(this.buttonImage);
        payload.push(this.imgUrl);
        
        payload.push(this.height);
        payload.push(this.width);

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
            let url = 'assets/images/' + this.imgPadrao + '.png'
            console.log(url);
            
        }else if(direction === 'down'){
            if(this.imgPadrao === '14'){
                image = 1;
            }else{
                image = Number(this.imgPadrao) + 1;
            }
            this.imgPadrao = String(image);
            let url = 'assets/images/' + this.imgPadrao + '.png'
            console.log(url);
            
        }
        
    }


    public onAddPicture(fileInput: any){
        if (fileInput.target.files && fileInput.target.files[0] && fileInput.target.files[0].size < 1000000) {
            this.bigImage = false;
            var reader = new FileReader();
            let self = this;
            //var img = new Image();
            reader.onload = () => {    
                var img = new Image();
                img.src = reader.result;           
                //console.log("ALTURA: " + img.height + "LARGURA: " + img.width);
                this.imageFile.content = reader.result.substring((reader.result.indexOf(this.base64Token) + this.base64Token.length));
                
                //let self = this;
                

                self.height = img.height;
                self.width = img.width;
                
                this.imageFile.name = fileInput.target.files[0].name;
                this.fileLoaded = true;
                //this.imgUrl = 'data:image/png;base64,'+ this.imageFile.content;
                this.imgUrl = this.imageFile.content;
                this.buttonImage = 'data:image/png;base64,'+ this.imageFile.content;

                img.onload = function() {
                    self.height = img.height;
                    self.width = img.width;
                    console.log(img.height + 'x' + img.width);
                    self.saveButtonConfiguration(true);
                 };
                 img.src = reader.result;
            };

            reader.readAsDataURL(fileInput.target.files[0]);  
            
        } else {
            this.bigImage = true;
        }
    }

    public closePicture(){
        this.imageFile = new Picture();
        this.imgUrl = null;
        $('#input-image').val('');
    }
    
}