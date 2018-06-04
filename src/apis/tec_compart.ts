import { UserModel } from '../models/user.model';
import { BaseRoute } from '../routes/route';
import { NextFunction, Request, Response } from "express";
import * as mongoose from 'mongoose'
import { TecladoCompartilhadoModel } from '../models/teclado_compartilhado.model';
import { isUndefined } from 'util';
// import * as mongoSanitize from 'express-mongo-sanitize';

export class TecladoCompartihado extends BaseRoute{
    public getTecladosCompartilhados(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[4].find().toArray(function(err, lista_teclados) {
            res.send(lista_teclados);
        });   
    }
    public setTecladoVisualizado(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[4].find({$and: [{"id": req.query.id}]}).toArray(function(err,lista_teclados) {
            if(!isUndefined(lista_teclados)){
                let tec = lista_teclados[0];
                if(isUndefined(tec.numVisualizacao)){
                    tec.numVisualizacao = 0;
                }
                tec.numVisualizacao = Number(Number(tec.numVisualizacao) + 1);
                res.locals.mongoAccess.coll[4].update({ $and: [{ "id": tec.id } ]}, tec)
            }
        });
        return true;
    };
    public setTecladoUsado(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[4].find({$or: [{"id": req.query.id}]}).toArray(function(err,lista_teclados) {
            if(!isUndefined(lista_teclados)){
                let tec = lista_teclados[0];
                if(isUndefined(tec.numUsado)){
                    tec.numUsado = 0;
                }
                tec.numUsado = Number(Number(tec.numUsado) + 1);
                res.locals.mongoAccess.coll[4].update({ $and: [{ "id": tec.id } ]}, tec)
            }
        });
        return true;
    };
    setTecladoCompartilhado(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[4].find( { $and: [{ "id": req.body['id'] }] }).toArray(function(err, tec_compart_list) {
            if(tec_compart_list.length !== 0){
                res.locals.mongoAccess.coll[4].update({ $and: [{ "id": req.body['id'] } ]}, req.body)
                res.send(JSON.stringify("updated"))
            } else {
                res.locals.mongoAccess.coll[4].insert(req.body, (err, result) => {
                })
                res.send(JSON.stringify("saved"));
            }
        });   
    }
    
    removeKeyboard(req: Request, res: Response, next: NextFunction){
        res.locals.mongoAccess.coll[4].find({ "usuarioEmail": req.query.usuarioEmail, "nameLayout": req.query.nameLayout}).toArray(function(err, tec_compart_list) {
            if(tec_compart_list.length !== 0){
                res.locals.mongoAccess.coll[4].remove({"usuarioEmail": req.query.usuarioEmail, "nameLayout": req.query.nameLayout }, true );
                res.locals.mongoAccess.coll[5].remove({"teclado": req.query.nameLayout+req.query.usuarioEmail}, true );
                res.send()
            } 
        });   
    }
}