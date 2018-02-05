/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class KeyboardModel {

    teclas: string[][];
    type: string;

    constructor() {
        this.teclas = [];
        this.type = 'none';
    }
}

