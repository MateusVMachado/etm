export class TecladoModel {

    teclas: any; //caption
    text: any;
    action: any;
    image: any;
    type: string;
    magnify: number;
    shared: boolean;


    constructor() {
        this.teclas = [];
        this.text = [];
        this.action = [];
        this.image = [];
        this.type = 'normal';
        this.magnify = 1.0;
    }
}
