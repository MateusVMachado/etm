import { UserModel } from "../models/user.model";
import { BaseRoute } from "../routes/route";
import { NextFunction, Request, Response } from "express";
import * as mongoose from "mongoose";
import { TecladoCompartilhadoModel } from "../models/teclado_compartilhado.model";
import { TecladoCompartilhadoNotaModel } from "../models/teclado_compartilhado.nota.model";
// import * as mongoSanitize from 'express-mongo-sanitize';

export class TecladoCompartihadoNota extends BaseRoute {
  public getNotaMedia(req: Request, res: Response, next: NextFunction) {
    this.getMongoAccess(res)
      .tec_compart_notas()
      .subscribe(tecNotasCollection => {
        tecNotasCollection
          .find({ teclado: req.query.teclado })
          .toArray(function(err, lista_notas) {
            let quant_rest = lista_notas.length;
            let media: number = 0;
            for (let i of lista_notas) {
              media = media + Number.parseInt(i.nota);
            }
            media = media / quant_rest;
            res.send({ value: media, numero_aval: quant_rest });
          });
      });
  }

  public getJaAvaliou(req: Request, res: Response, next: NextFunction) {
    this.getMongoAccess(res)
      .tec_compart_notas()
      .subscribe(tecNotasCollection => {
        tecNotasCollection
          .find({
            teclado: req.query.teclado,
            usuarioEmail: req.query.usuarioEmail
          })
          .toArray(function(err, resposta) {
            if (resposta.length >= 1) {
              res.send({ value: true });
            } else {
              res.locals.mongoAccess.coll[5].insert({
                teclado: req.query.teclado,
                usuarioEmail: req.query.usuarioEmail,
                nota: req.query.nota
              });
              res.send({ value: false });
            }
          });
      });
  }
}
