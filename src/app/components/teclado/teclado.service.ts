import { Injectable } from '@angular/core';
import { TecladoModel } from './teclado.model';

import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { OpenFACLayout } from 'openfac/OpenFac.ConfigContract';

@Injectable()
export class TecladoService {

    teclado: TecladoModel = new TecladoModel();

    public row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
    public pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
    public sRow: string[] = ['*cpslck', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*arrowup', '*kbdrtrn'];
    public tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\'', '*arrowleft', '*arrowdown', '*arrowright'];

    public crow: string[] = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '*bckspc'];
    public cpRow: string[] = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
    public csRow: string[] = ['*cpslck', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç',  ':', '*arrowup', '*kbdrtrn'];
    public ctRow: string[] = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '\"', '*arrowleft', '*arrowdown', '*arrowright'];

    constructor(private http: HttpClient) {  }

    loadTeclado(type: string): TecladoModel {
        this.teclado.teclas = []; // Clear teclado

        if ( type === 'normal') {
            this.teclado.teclas.push(this.row);
            this.teclado.teclas.push(this.pRow);
            this.teclado.teclas.push(this.sRow);
            this.teclado.teclas.push(this.tRow);
            this.teclado.type = 'normal';
        } else if ( type === 'caps') {
            this.teclado.teclas.push(this.crow);
            this.teclado.teclas.push(this.cpRow);
            this.teclado.teclas.push(this.csRow);
            this.teclado.teclas.push(this.ctRow);
            this.teclado.type = 'caps';
        }

        return this.teclado;

    }

    loadData() {
        return this.http.get<OpenFACLayout>('http://localhost:8080/keyboard');
    }

}
