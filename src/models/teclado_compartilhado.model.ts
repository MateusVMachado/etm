export class TecladoCompartilhadoModel {

    _id: string;
    id: string;
    nameLayout: any;
    dataPublicacao: string;
    tecladoEmail: any;
    usuarioEmail: any;
    keyboardImage : any
    keyboardVoice : any
    numVisualizacao : any
    numUsado : any

    constructor() {
        this.nameLayout = '';
        this.dataPublicacao = '';
        this.tecladoEmail = '';
        this.usuarioEmail = '';
        this.keyboardImage = false;
        this.keyboardVoice = false;
        this.numVisualizacao = 0
        this.numUsado = 0;
    }
}
