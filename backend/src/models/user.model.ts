import { Picture } from './picture.model';
import uuid = require('uuid');
/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class UserModel {

    _id: string;
    userId: string;
    fullName: string;
    email: string;
    password: string;
    picture: Picture;

    constructor() {
        this.userId = uuid();
        this.fullName = '';
        this.email = '';
        this.password = '';
        this.picture = new Picture();
    }
}
