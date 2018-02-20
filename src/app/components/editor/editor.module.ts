import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CKEditorModule } from 'ng2-ckeditor';

import { EditorComponent } from './editor.component';

@NgModule({
    declarations: [ EditorComponent ],
    imports: [ CommonModule, FormsModule, CKEditorModule ],
    exports: [ EditorComponent ],
    providers: [],
})
export class EditorModule {}