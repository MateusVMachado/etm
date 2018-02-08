/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class KeyboardModel {

    userId: string;
    teclas: string[][];
    type: string;

    constructor() {
        this.userId = undefined;
        this.teclas = [];
        this.type = 'none';
    }
}

