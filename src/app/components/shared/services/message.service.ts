import { HeaderService } from '../../header/header.service';
import { Injectable } from '@angular/core';
import swal from 'sweetalert';
import { TranslateService } from "@ngx-translate/core";
import {SideBarService} from "../../sidebar/sidebar.service" 

@Injectable()
export class MessageService {

    constructor(private translateService: TranslateService, private sidebarService: SideBarService, 
        private headerService: HeaderService) {
        translateService.setDefaultLang('pt-br');
    }

    setLanguage(idioma: string){
        this.translateService.use(idioma);
        this.sidebarService.emitSideBarCommand('reload');
        this.headerService.emitHeaderCommand('reload');
    }

    info(message: string, title?: string): any { 
        swal({
            title: title,
            text: message,
            icon: "question",
        })
    }

    success(title: string, message?: string): Promise<any> { 
        return swal({
            title: title,
            text: message,
            icon: "success",
        })
    }

    warn(message: string, title?: string): any { 
        swal({
            title: title,
            text: message,
            icon: "warn",
        })
    }

    error(message: string, title?: string): any {
        swal({
            title: title,
            text: message,
            icon: "error",
        })    
    }

    confirm(message: string, titleOrCallBack?: string | ((result: boolean) => void), callback?: (result: boolean) => void): any { }

    public getTranslation(message: string){
      let translate: string;
      this.translateService.get(message).subscribe((res: string) => {
        translate = res;
      });
      return translate;
    }
}