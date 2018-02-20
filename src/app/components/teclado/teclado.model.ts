/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class TecladoModel {

    teclas: string[][];
    type: string;

    constructor() {
        this.teclas = [];
        this.type = 'normal';
    }
}
