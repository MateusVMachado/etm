import { AuthService } from '../shared/services/auth.services';
import { Injectable, Injector } from '@angular/core';
import { TecladoModel } from './teclado.model';

import { HttpClient, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { OpenFACLayout } from 'openfac/OpenFac.ConfigContract';
import { Subject } from 'rxjs';
import { AppServiceBase } from '../shared/services/app-service-base.service';

@Injectable()
export class TecladoService extends AppServiceBase {

    teclado: TecladoModel = new TecladoModel();
    public tecladoSubject = new Subject<any>();  
    public tecladoReady = new Subject<boolean>();
    

    public row: string[] = ['\'', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '*bckspc'];
    public pRow: string[] = ['*tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
    public sRow: string[] = ['*cpslck', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç',  ';', '*arrowup', '*kbdrtrn'];
    public tRow: string[] = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '\'', '*arrowleft', '*arrowdown', '*arrowright'];

    public crow: string[] = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '*bckspc'];
    public cpRow: string[] = ['*tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'];
    public csRow: string[] = ['*cpslck', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç',  ':', '*arrowup', '*kbdrtrn'];
    public ctRow: string[] = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', '\"', '*arrowleft', '*arrowdown', '*arrowright'];

    constructor(protected injector: Injector, private http: HttpClient, private authService: AuthService) {
        super(injector);
      }


    emitTecladoCommand(editor: any) {
        this.tecladoSubject.next(editor);
    }

    emitTecladoReady(isReady: boolean) {
        this.tecladoReady.next(isReady);
    }
    
    subscribeToTecladoSubject() {
        return this.tecladoSubject.asObservable();      
    }

    subscribeToTecladoReady() {
        return this.tecladoReady.asObservable();      
    }
    
     convertLayoutToKeyboard(keyboard: TecladoModel, layout: OpenFACLayout){
        keyboard.teclas = [];
        layout.Lines.forEach(element => {
            let line = [];
            element.Buttons.forEach(element => {
                line.push(element.Text);
            });
            keyboard.teclas.push(line);
            
        });
        keyboard.type = layout.nameLayout;
    }
      
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
        return this.http.get<OpenFACLayout>(this.backendAddress + '/keyboard');
    }

    loadDataFromUser(email: string) {
        return this.http.get<OpenFACLayout>(this.backendAddress + `/keyboardByUser?email=${email}`);
    }

    loadSingleKeyboard(nameLayout: string, email: string){
        return this.http.get<OpenFACLayout>(this.backendAddress + `/getSingleKeyboard?nameLayout=${nameLayout}&email=${email}`, this.getDefaultHeaders());
    }

}
