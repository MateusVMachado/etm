import { Injector } from '@angular/core';
import { AppServiceBase } from '../services/app-service-base.service';
import { MessageService } from '../services/message.service';


export abstract class AppBaseComponent {
    public messageService: MessageService
    protected appServiceBase: AppServiceBase;
    constructor(injector: Injector) {
        this.messageService = injector.get(MessageService);
        this.appServiceBase = injector.get(AppServiceBase);
    }
}