import { Observable, bindCallback, of,  } from 'rxjs';
import { map } from 'rxjs/operators';
import { Collection } from 'mongodb';

export class MongoAccessModel {

    private collections: Array<string> = ["users", "keyboards", "configurations", "logs", "tec_compart", "tec_compart_notas", "password_log", "predictor_pt_br"];
    private collectionsMap: Map<string, any>;
    private mongoClient: any;
    private poolSize: number;
    private connected: boolean;

    private getCollection(collectionKey: string): Observable<any>{
        if(this.connected){
            return of(this.collectionsMap.get(collectionKey));
        }else{
            return this.doConnect().pipe(
                map( (values) => {
                    let database = values[1];
                    let etmDb = database.db('etm-database');
                    for (let index = 0; index < this.collections.length; index++) {
                        let collectionName = this.collections[index];
                        this.collectionsMap.set(collectionName, etmDb.collection(collectionName))
                    }
                    return etmDb;
                }),
                map( (etmDb) => {
                    this.connected = true;
                    return this.collectionsMap.get(collectionKey);
                })
            )
        }
    }

    private mongoConnect(mongoClient: any, mongoUrl: string, poolSize: number, callback: Function){
        let options = {poolSize: poolSize}
        mongoClient.connect(mongoUrl, options, callback);
    }

    private doConnect(){
        let doConnectObservable = bindCallback<any, string, number, any>(this.mongoConnect);
        let mongoUrl = process.env.MONGOHQ_URL|| 'mongodb://localhost:27017';
        return doConnectObservable(this.mongoClient, mongoUrl, this.poolSize);
    }

    constructor(mongoClient: any) {
        this.mongoClient = mongoClient;
        this.poolSize = 100;
        this.connected = false;
        this.collectionsMap = new Map<string, any>();
    }

    users(): Observable<any> {
        return this.getCollection("users");
    }

    keyboards(): Observable<any> {
        return this.getCollection("keyboards");
    }

    configurations(): Observable<any> {
        return this.getCollection("configurations");
    }

    logs(): Observable<any> {
        return this.getCollection("logs");
    }
    
    tec_compart(): Observable<any> {
        return this.getCollection("tec_compart");
    }

    tec_compart_notas(): Observable<any> {
        return this.getCollection("tec_compart_notas");
    }

    password_log(): Observable<any> {
        return this.getCollection("password_log");
    }

    predictor_pt_br(): Observable<any> {
        return this.getCollection("predictor_pt_br");
    }

}

