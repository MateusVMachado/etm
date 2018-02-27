import { Picture } from './picture.model';
/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class UserModel {

    _id: string;
    fullName: string;
    email: string;
    password: string;
    picture: Picture;

    constructor() {
        //this.userId = undefined;
        this.fullName = '';
        this.email = '';
        this.password = '';
        this.picture = new Picture();
    }
}
