/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class UserModel {

    //userId: string;
    fullName: string;
    email: string;
    password: string;

    constructor() {
        //this.userId = undefined;
        this.fullName = '';
        this.email = '';
        this.password = '';
    }
}
