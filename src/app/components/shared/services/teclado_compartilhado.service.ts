import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { OpenFACLayout } from '../../layout-editor/layout.model';
import { TecladoCompartilhadoModel } from '../models/teclado_compartilhado';
import { User } from '../models/user';
import { AppServiceBase } from './app-service-base.service';
import { AuthService } from './auth.services';

@Injectable()
export class TecladoCompartilhadoService extends AppServiceBase {
    
    constructor(protected injector: Injector, private http: HttpClient, private authService : AuthService) {
        super(injector);
    }
    // //TECLADO
    getTeclado(email :string) : Observable<any>{
        return this.http.get(this.backendAddress + `/getSingleKeyboardByEmail?email=${email}`);
    }
    usarTeclado(teclado: OpenFACLayout){
        let user : User = this.authService.getLocalUser(); 
        teclado.email = user.email;
        return this.http.post(this.backendAddress + `/keyboard/insertNewKeyboard?nameLayout=${teclado.nameLayout}&email=${teclado.email}` , teclado, { responseType: 'text', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.jwt} });
    }
    setTecladoUsado(id : string){
        return this.http.get(this.backendAddress + `/tec_compart/setTecladoUsado?id=${id}`);
    }
    compartilharTeclado(tecladoCompartilhado: TecladoCompartilhadoModel){
        tecladoCompartilhado.dataPublicacao = this.getDataAtual();
        return this.http.post(this.backendAddress + '/tec_compart/shareKeyboard?tecladoCompartilhado',tecladoCompartilhado, {responseType: 'text'});
    }
    getDataAtual(){
        let data_atual: any = new Date().toISOString().split('T');
        data_atual = data_atual[0];
        data_atual = data_atual.split('-')
        data_atual = data_atual[2] + "/" + data_atual[1] + "/"  + data_atual[0]
        return data_atual;
    }
    //TECLADO COMPARTILHADO
    getListaTecladosCompartilhados() : Observable<any>{
        return this.http.get(this.backendAddress + '/tec_compart');
    }
    setTecladoVisualizado(id : string){
        return this.http.get(this.backendAddress + `/tec_compart/setTecladoVisualizado?id=${id}`);
    }
    removeTeclado(usuarioEmail : string, nameLayout : string){
        return this.http.get(this.backendAddress + `/tec_compart/removeKeyboard?usuarioEmail=${usuarioEmail}&nameLayout=${nameLayout}`);
    }
    
    //USUARIO
    getUsuario(email :string) : Observable<any>{
        return this.http.get(this.backendAddress + `/user?email=${email}`);
    }
    
    //NOTA
    getNota(id) : Observable<any>{
        return this.http.get(this.backendAddress + `/tec_compart_nota?teclado=${id}`);
    }
    getJaAvaliou(teclado,usuarioEmail,nota) : Observable<any>{
        return this.http.get(this.backendAddress + `/tec_compart_nota/avaliar?teclado=${teclado}&usuarioEmail=${usuarioEmail}&nota=${nota}`);
    }
}