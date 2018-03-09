import { Picture } from "./picture";

export class User {
    _id: string;
    fullName: string;
    email: string;
    password: string;
    picture: Picture;
    jwt: string;

    constructor(){
        this.picture = new Picture();
    }
}