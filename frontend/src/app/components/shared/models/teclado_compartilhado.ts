export class TecladoCompartilhadoModel {

    _id: string;
    id: string;
    dataPublicacao: string;
    nameLayout: string;
    usuarioEmail: string;
    keyboardImage : boolean
    keyboardVoice : boolean
    numVisualizacao : number
    numUsado : number
    nota : number
    numeroAvaliacoes : number

    constructor() {
        this.dataPublicacao = '';
        this.nameLayout = '';
        this.usuarioEmail = '';
        this.keyboardImage = false;
        this.keyboardVoice = false;
        this.numVisualizacao = 0;
        this.numUsado = 0;
        this.nota = 0;
    }

    
}
