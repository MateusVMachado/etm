/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class KeyboardModel {

    //userId: string;
    teclas: string[][];
    text: string[][];
    type: string;

    constructor() {
        //this.userId = undefined;
        this.teclas = [];
        this.text = [];
        this.type = 'none';
    }
}

