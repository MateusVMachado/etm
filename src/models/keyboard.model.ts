/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class KeyboardModel {

    //userId: string;
    teclas: string[][];
    text: string[][];
    action: string[][];
    image: string[][];
    type: string;
    magnify: number;

    constructor() {
        //this.userId = undefined;
        this.teclas = [];
        this.text = [];
        this.action = [];
        this.image = [];
        this.type = 'none';
        this.magnify = 1.0;
    }
}

