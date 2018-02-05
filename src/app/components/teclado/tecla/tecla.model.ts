/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class TeclaModel {

    teclas: string[][];
    type: string;

    constructor() {
        this.teclas = [];
        this.type = 'normal';
    }
}
