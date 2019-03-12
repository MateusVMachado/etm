import { Observable, bindCallback, of,  } from 'rxjs';
import { map , tap} from 'rxjs/operators';
import { Collection } from 'mongodb';

export class MongoAccessModel {

    private collections: Array<string> = ["users", "keyboards", "configurations", "logs", "tec_compart", "tec_compart_notas", "password_log", "predictor_pt_br", "predictor_local_pt_br"];
    private collectionsMap: Map<string, any>;
    private mongoClient: any;
    private etmDb: any;
    private poolSize: number;
    private connected: boolean;

    private getCollection(collectionKey: string): Observable<any>{
        if(this.connected){
            return of(this.collectionsMap.get(collectionKey));
        }else{
            return this.doConnect().pipe( map(() => {
                for (let index = 0; index < this.collections.length; index++) {
                    let collectionName = this.collections[index];
                    this.collectionsMap.set(collectionName, this.etmDb.collection(collectionName))
                }
                this.connected = true;
                return this.collectionsMap.get(collectionKey);
            }
            ))
        }
    }

    private mongoConnect(mongoClient: any, mongoUrl: string, poolSize: number, callback: Function){
        let options = {poolSize: poolSize}
        mongoClient.connect(mongoUrl, options, callback);
    }

    private doConnect(){
        let doConnectObservable = bindCallback<any, string, number, any>(this.mongoConnect);
        let mongoUrl = process.env.MONGOHQ_URL|| process.env.MONGODB; //'mongodb://172.17.0.1:27017'
        return doConnectObservable(this.mongoClient, mongoUrl, this.poolSize).pipe(
            map( (values) => {
                let database = values[1];
                this.etmDb = database.db('etm-database');
                return this.etmDb;
            })
        );
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

    predictor_local_pt_br(): Observable<any> {
        return this.getCollection("predictor_local_pt_br");
    }

    predictor_user(id: string): Observable<any> {
        const dbName = 'predictor_user_' + id;
        if(this.connected){
            return of(this.etmDb.collection(dbName));
        } else {
            return this.doConnect().pipe(map( () => {
                return this.etmDb.collection(dbName);
            }));
        }
    }

}
