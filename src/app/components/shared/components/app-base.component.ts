import { MessageService } from '../services/message.service';
import { Injector } from '@angular/core';

export abstract class AppBaseComponent {
    protected messageService: MessageService
    
    constructor(injector: Injector) {
        this.messageService = injector.get(MessageService);
    }
}