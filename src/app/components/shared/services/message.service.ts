import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import swal from 'sweetalert';
import { HeaderService } from '../../header/header.service';
import { SideBarService } from "../../sidebar/sidebar.service";

@Injectable()
export class MessageService implements OnDestroy{

    private setLanguageSubscription: Subscription;
    private getTranslationSubscription: Subscription;

    constructor(private translateService: TranslateService, private sidebarService: SideBarService, 
        private headerService: HeaderService) {
        translateService.setDefaultLang('pt-br');
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.setLanguageSubscription.unsubscribe();
        this.getTranslationSubscription.unsubscribe();
    }

    setLanguage(idioma: string){
        this.setLanguageSubscription = this.translateService.use(idioma).subscribe(() => {
            this.sidebarService.emitSideBarCommand('reload');
            this.headerService.emitHeaderCommand('reload');
        });
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
      this.getTranslationSubscription = this.translateService.get(message).subscribe((res: string) => {
        translate = res;
      });
      return translate;
    }
}