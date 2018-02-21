import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

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