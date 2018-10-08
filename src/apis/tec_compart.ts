
import { BaseRoute } from '../routes/route';
import { NextFunction, Request, Response } from "express";
import { isUndefined } from 'util';

export class TecladoCompartihado extends BaseRoute{
    public getTecladosCompartilhados(req: Request, res: Response, next: NextFunction){

        this.getMongoAccess(res)
      .tec_compart()
      .subscribe(tecCompartCollection => {
        tecCompartCollection.find().toArray(function(err, lista_teclados) {
            res.send(lista_teclados);
        });
      });

           
    }
    public setTecladoVisualizado(req: Request, res: Response, next: NextFunction){

        this.getMongoAccess(res)
      .tec_compart()
      .subscribe(tecCompartCollection => {
        tecCompartCollection.find({$and: [{"id": req.query.id}]}).toArray(function(err,lista_teclados) {
            if(!isUndefined(lista_teclados)){
                let tec = lista_teclados[0];
                if(isUndefined(tec.numVisualizacao)){
                    tec.numVisualizacao = 0;
                }
                tec.numVisualizacao = Number(Number(tec.numVisualizacao) + 1);
                tecCompartCollection.update({ $and: [{ "id": tec.id } ]}, tec)
            }
        });
      });
      return true;
    };
    public setTecladoUsado(req: Request, res: Response, next: NextFunction){

        this.getMongoAccess(res)
      .tec_compart()
      .subscribe(tecCompartCollection => {
        tecCompartCollection.find({$or: [{"id": req.query.id}]}).toArray(function(err,lista_teclados) {
            if(!isUndefined(lista_teclados)){
                let tec = lista_teclados[0];
                if(isUndefined(tec.numUsado)){
                    tec.numUsado = 0;
                }
                tec.numUsado = Number(Number(tec.numUsado) + 1);
                tecCompartCollection.update({ $and: [{ "id": tec.id } ]}, tec)
            }
        });

      });
        
        return true;
    };

    setTecladoCompartilhado(req: Request, res: Response, next: NextFunction){

        this.getMongoAccess(res)
      .tec_compart()
      .subscribe(tecCompartCollection => {

        tecCompartCollection.find( { $and: [{ "id": req.body['id'] }] }).toArray(function(err, tec_compart_list) {
            if(tec_compart_list.length !== 0){
                tecCompartCollection.update({ $and: [{ "id": req.body['id'] } ]}, req.body)
                res.send(JSON.stringify("updated"))
            } else {
                tecCompartCollection.insert(req.body, (err, result) => {
                })
                res.send(JSON.stringify("saved"));
            }
        }); 

      });

          
    }
    
    removeKeyboard(req: Request, res: Response, next: NextFunction){

        this.getMongoAccess(res)
      .tec_compart()
      .subscribe(tecCompartCollection => {

        tecCompartCollection.find({ "usuarioEmail": req.query.usuarioEmail, "nameLayout": req.query.nameLayout}).toArray(function(err, tec_compart_list) {
            if(tec_compart_list.length !== 0){
                tecCompartCollection.remove({"usuarioEmail": req.query.usuarioEmail, "nameLayout": req.query.nameLayout }, true );

                this.getMongoAccess(res)
      .tec_compart_notas()
      .subscribe(tecCompartCollection => {
        tecCompartCollection.remove({"teclado": req.query.nameLayout+req.query.usuarioEmail}, true );
        res.send()
      });

                
            } 
        });
      });
    }
}