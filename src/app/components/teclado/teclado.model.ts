export class TecladoModel {

    teclas: any; //caption
    text: any;
    action: any;
    type: string;


    constructor() {
        this.teclas = [];
        this.text = [];
        this.action = [];
        this.type = 'normal';
    }
}
