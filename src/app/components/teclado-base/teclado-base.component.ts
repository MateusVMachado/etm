import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import * as $ from "jquery";
import { OpenFACLayout } from "openfac/OpenFac.ConfigContract";
import { isUndefined } from "util";
import { ActiveLineCol } from "../teclado/activeLine.model";
import { TecladoModel } from "../teclado/teclado.model";

@Component({
    selector: 'app-teclado-base',
    templateUrl: './teclado-base.component.html',
    styleUrls: ['./teclado-base.component.css']
})
export class TecladoBaseComponent implements OnInit, AfterViewInit {
    
    @Input() layout: OpenFACLayout;
    @Input() teclado: TecladoModel
    private activeLine: ActiveLineCol;
    private idTeclado : string;
    private possuiImagem = false;
    
    ngOnInit() {
        if(isUndefined(this.teclado)){
            this.teclado = new TecladoModel();
            if(!isUndefined(this.layout) && !isUndefined(this.layout["Lines"])){
                this.convertLayoutToKeyboard(this.layout);
                this.activeLine = new ActiveLineCol();
                this.activeLine.col = -1;
                this.activeLine.line = -1;
                this.idTeclado = (this.layout.email).replace('.','x').replace('@','a')+Math.round((Math.random())*100);
            }
        }
        else{
            this.activeLine = new ActiveLineCol();
            this.activeLine.col = 1;
            this.activeLine.line = -1;
        }
    }
    ngAfterViewInit(){
        this.adjustImages();
        let tecladoHtml = document.getElementById(this.idTeclado);
        if ( $('.teclado-container').width() < $(tecladoHtml).width() ) $(tecladoHtml).addClass('overflow');
    }
    setActiveLine(activeLine: ActiveLineCol) {
        if(this.teclado != undefined){
            this.activeLine = activeLine;
        }
    }
    
    private convertLayoutToKeyboard(layout: OpenFACLayout){
        this.layout.Lines["teclas"] = [];
        this.layout.Lines["text"] = [];
        this.layout.Lines["action"] = []; 
        this.layout.Lines["image"] = []; 
        for(let i = 0 ; i < layout.Lines.length; i++){ 
            let line = []; 
            let textL = []; 
            let actionL = [];  
            let imageL = [];  
            for( let j = 0 ; j < layout.Lines[i].Buttons.length; j++){ 
                line.push(layout.Lines[i].Buttons[j].Caption); 
                textL.push(layout.Lines[i].Buttons[j].Text); 
                actionL.push(layout.Lines[i].Buttons[j].Action);  
                if(layout.Lines[i].Buttons[j].Image !== undefined){
                    imageL.push(layout.Lines[i].Buttons[j].Image);  
                    this.possuiImagem = true;
                }
            }
            
            this.layout.Lines["teclas"].push(line);  
            this.layout.Lines["text"].push(textL); 
            this.layout.Lines["action"].push(actionL); 
            if(imageL.length > 0) this.layout.Lines["image"].push(imageL); 
        }
        this.layout.Lines["type"] = layout.nameLayout;
        this.teclado.teclas = this.layout.Lines["teclas"];
        this.teclado.text = this.layout.Lines["text"];
        this.teclado.image = this.layout.Lines["image"];
        this.teclado.action = this.layout.Lines["action"];
        this.teclado.type = this.layout.Lines["type"];
        this.teclado.magnify = this.layout.magnify;
    }
    
    public adjustImages(){
        if(this.teclado.magnify == null) this.teclado.magnify = 1;
        $('#'+this.idTeclado +' .notImage').css('font-size', 18 * this.teclado.magnify);
        if(!this.possuiImagem){
            return;
        }
        let imgWidth = [];
        let lineHeight : number;
        let imgRows = [];
        for(let x = 0; x < this.teclado.teclas.length; x ++ ){
            lineHeight = 0;
            for(let y = 0 ; y < this.teclado.teclas[x].length; y ++){
                if(this.teclado.teclas[x][y].split('$')[0] === '*img'){
                    //CARREGAMENTO DA IMAGEM
                    let imghtml = document.getElementById(this.idTeclado).getElementsByClassName('images'+x+'x'+y)[0];
                    $(imghtml).css('background', 'url('+ this.layout.Lines["image"][x][y] +') no-repeat');
                    
                    let height : number = this.teclado.teclas[x][y].split('$')[1].split('#')[0];
                    let width : number = this.teclado.teclas[x][y].split('$')[1].split('#')[1];
                    $(imghtml).height(height * 0.5);
                    $(imghtml).width(width * 0.5);
                    
                    imgWidth.push($(imghtml).outerWidth());
                    lineHeight = $(imghtml).outerHeight();
                    if(!imgRows.includes(x)) imgRows.push(x);
                }
            }
            if(imgRows.includes(x)){
                let row = document.getElementById(this.idTeclado).getElementsByTagName('tr')[x];
                if(!isUndefined(row)){
                    let imgs = row.getElementsByClassName('btn_com_img');
                    if(imgs.length > 0){
                        let keys = row.getElementsByClassName('notImage');
                        for(let key = 0 ; key < keys.length; key ++){
                            // REDIMENCIONA HEIGHT DE NÃO IMAGENS
                            //-6 => RETIRA-SE O TAMANHO DO PADDING
                            $(keys[key]).css('height', (lineHeight - 6) )
                            //REDIMENCIONA WIDTH DE NÃO IMAGENS
                            if(imgWidth[x] != undefined){
                                $(keys[key]).css("width", imgWidth[x]);
                            }
                            else{
                                $(keys[key]).css("width", lineHeight);
                            }
                        }
                    }
                }
            }
        }
    }
}