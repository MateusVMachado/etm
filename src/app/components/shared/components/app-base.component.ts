import { MessageService } from '../services/message.service';
import { Injector } from '@angular/core';
import { AppServiceBase } from '../services/app-service-base.service';


export abstract class AppBaseComponent {
    protected messageService: MessageService
    protected appServiceBase: AppServiceBase;
    constructor(injector: Injector) {
        this.messageService = injector.get(MessageService);
        this.appServiceBase = injector.get(AppServiceBase);
    }
}