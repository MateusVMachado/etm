export class TecladoCompartilhadoNotaModel {

    _id: string;
    teclado: string;
    usuarioEmail: string;
    nota: string;

    constructor() {
        this.teclado = '';
        this.nota = '';
        this.usuarioEmail = '';
    }
}
