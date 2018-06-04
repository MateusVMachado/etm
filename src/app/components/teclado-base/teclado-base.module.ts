import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TecladoBaseComponent } from "./teclado-base.component";

@NgModule({
    declarations:[TecladoBaseComponent],
    exports:[TecladoBaseComponent],
    imports:[
        CommonModule,
        FormsModule
    ],
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ]
})

export class TecladoBaseModule{ }