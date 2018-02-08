/*export interface TecladoModel {
        teclas: string[][];
}
*/
export class MongoAccessModel {

    database: any;
    coll: any[];

    constructor() {
        this.database = undefined;
        this.coll = [];
    }
}

