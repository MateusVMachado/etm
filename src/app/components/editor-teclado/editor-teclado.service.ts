import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class EditorTecladoService {

  
  public editorInstanceSubject = new Subject<any>();  
  private tamanho: number;
  private tamanhoSubject = new BehaviorSubject<number>(this.tamanho)

  constructor() { }

  emitEditorInstance(editor: any) {
    this.editorInstanceSubject.next(editor);
  }
  

  subscribeToEditorSubject() {
      return this.editorInstanceSubject.asObservable();      
  }

  setHeight(tam: number){
    this.tamanho = tam;
    this.tamanhoSubject.next(tam);
  }

  getHeight(){
    return this.tamanhoSubject.asObservable();
  }


}