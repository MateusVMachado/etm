/**
 * Define o link do front e do MongoDB durante a inicialização de um novo container
 */
export class DockerEnviroments {

    public MongoDbUrl: string = process.env.MONGOURL;
    public FrontEndUrl: string = process.env.FRONTURL;
    public isDebug: string = process.env.ISDEBUG;
}