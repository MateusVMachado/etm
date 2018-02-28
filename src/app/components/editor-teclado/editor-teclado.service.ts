import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class EditorTecladoService {

  
  public editorInstanceSubject = new Subject<any>();  

  constructor() { }

  emitEditorInstance(editor: any) {
    this.editorInstanceSubject.next(editor);
  }
  

  subscribeToEditorSubject() {
      return this.editorInstanceSubject.asObservable();      
  }


}