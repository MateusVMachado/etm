import { AppBaseComponent } from '../../shared/components/app-base.component';
import { Component, Injector, OnDestroy, OnInit, AfterContentInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutEditorService } from '../layout-editor.service';
import { CaptionTextService } from './caption-text.service';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { Picture } from '../../shared/models/picture';
import { ChangeDetectorRef } from '@angular/core';

import { DomSanitizer,  SafeHtml,  SafeUrl, SafeStyle } from '@angular/platform-browser';

@Component({
    selector: 'app-caption-text-modal',
    templateUrl: './caption-text-modal.component.html',
    styleUrls: ['./caption-text-modal.component.css']
})
export class CaptionTextModalComponent extends AppBaseComponent implements OnInit, OnDestroy, AfterContentInit {

    
    public falar: boolean = false;
    public escrever: boolean = true;
    public imagem: boolean = false;
    public keyboardName: string = "";

    
    public bsImg: number;
    public sysImg: boolean = true;
    public sysImgPath: string;


    public buttonText: string = "";
    public buttonCaption: string = "";
    public buttonAction: string = "";
    public buttonImage: string = "";

    private captionSubscribe: Subscription;

    private readonly base64Token = ';base64,';
    public bigImage: boolean = false;
    public imageFile: Picture;
    public fileLoaded: Boolean = false;
    public saved: boolean = false;

    public imgUrl: string;
    public height: number = 0;
    public width: number = 0;

    private timer: any; 
    private counter: number;

    constructor(private activeModal: NgbActiveModal,
                private layoutEditorService: LayoutEditorService,
                private captionTextService: CaptionTextService,
                private injector: Injector,
                private cdr: ChangeDetectorRef,
                private sanitizer: DomSanitizer) {
                    super(injector)
                    
                    this.bsImg = 1;
                    this.sysImgPath = '../../../assets/images/' + this.bsImg.toString() + '.png';    
                    this.timer = setInterval(this.newCheckRound.bind(this), 100);

                    this.captionSubscribe = this.captionTextService.subscribeToCaptionTextSubject().subscribe((result)=>{
                    
                        
                        if(result[1].substring(0,1) === '*' && result[1] !== '*img'){
                            this.buttonCaption = "";
                            this.buttonText = "";
                            this.buttonAction = result[2]; 
                        } else {
                            this.buttonCaption = result[0].target.value;
                            this.buttonText = result[1];
                            this.buttonAction = result[2];
                            this.buttonImage = result[3];
                            
                            // console.log('button: ' + this.buttonImage)

                            if(this.buttonImage) {
                                this.imagem = true;
                            
                                this.imgUrl = this.buttonImage;
                            }    
                            if(result[4].split('$')[0] === '*img'){
                                this.imagem = true;
                            } else {
                                this.imagem = false;
                            }

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

    ngAfterContentInit() {

    }

    ngOnInit() { 
        

        if(this.sysImg && !this.imgUrl) this.readLocalImg();
        

    }

    ngOnDestroy() {

        this.captionSubscribe.unsubscribe();
        this.bsImg = 1;
        clearInterval(this.timer);
    }

    private newCheckRound(){
        this.cdr.detectChanges();
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
        if(this.sysImg) this.readLocalImg();
        
        let payload = new Array();    
        
        if(this.buttonImage && this.imagem)this.buttonCaption = "*img";

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

        if(!this.imagem) this.sysImg = false;
        payload.push(this.sysImg);
        payload.push(this.imagem);

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

    public slideImage(direction: string){
        let image: number;

        if(direction === 'up'){
            if(this.bsImg === 1){
                this.bsImg = 14;
            }else{
                this.bsImg = this.bsImg - 1;
            }

            this.sysImgPath = '../../../assets/images/' + this.bsImg.toString() + '.png';
            if(this.sysImg) this.readLocalImg();
            
        }else if(direction === 'down'){
            if(this.bsImg === 14){
                this.bsImg = 1;
            }else{
                this.bsImg = this.bsImg + 1;
            }

            this.sysImgPath = '../../../assets/images/' + this.bsImg.toString() + '.png';

            if(this.sysImg) this.readLocalImg();
            
        }
        
    }


    public onAddPicture(fileInput: any){
        this.sysImg = false;
        this.imageFile = new Picture();
        if (fileInput.target.files && fileInput.target.files[0] && fileInput.target.files[0].size < 500000) {
            this.bigImage = false;
            var reader = new FileReader();
            let self = this;
            
            reader.onload = () => {    
                var img = new Image();
                img.src = reader.result;           
                
                this.imageFile.content = reader.result.substring((reader.result.indexOf(this.base64Token) + this.base64Token.length));
            
                self.height = img.height;
                self.width = img.width;
                
                this.imageFile.name = fileInput.target.files[0].name;
                this.fileLoaded = true;
            
                this.imgUrl = this.imageFile.content;
                this.buttonImage = 'data:image/png;base64,'+ this.imageFile.content;

                img.onload = function() {
                    self.height = img.height;
                    self.width = img.width;
                    // console.log(img.height + 'x' + img.width);
                 };
                 img.src = reader.result;
            };

            reader.readAsDataURL(fileInput.target.files[0]);  
            
        } else {
            this.bigImage = true;
        }
    }

    public closePicture(){
        this.sysImg = true;
        this.imageFile = new Picture();
        this.imgUrl = null;
        $('#input-image').val('');

        if(this.sysImg) this.readLocalImg();
    }

    public readLocalImg()  {
            this.imageFile = new Picture();
            let xhr = new XMLHttpRequest();       
            xhr.open("GET", this.sysImgPath, true); 
            xhr.responseType = "blob";
            let self = this;
            xhr.onload = function (e) {
                    let img = new Image();
   
                    
                    let reader = new FileReader();
                    reader.onload = function(event) {
                        let res = reader.result;
                        self.imageFile.content =  reader.result.substring((reader.result.indexOf(self.base64Token) + self.base64Token.length));

                        self.buttonImage = 'data:image/png;base64,' + self.imageFile.content;

                        img.onload = function() {
                            self.height = img.height;
                            self.width = img.width;

                         };
                         img.src = reader.result;
                        
                    }
                    let file = xhr.response;
                    
                    reader.readAsDataURL(file)
            };
            xhr.send();
    }        
    
}