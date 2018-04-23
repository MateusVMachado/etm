export class TecladoModel {

    teclas: any; //caption
    text: any;
    action: any;
    image: any;
    type: string;


    constructor() {
        this.teclas = [];
        this.text = [];
        this.action = [];
        this.image = [];
        this.type = 'normal';
    }
}
