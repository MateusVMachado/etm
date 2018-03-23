import { AppBaseComponent } from '../shared/components/app-base.component';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import { ConfigModel } from './config.model';
import { GeneralConfigService } from './general-config.service';
import { NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, Input, OnInit, Injectable } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { FormsModule, ReactiveFormsModule }   from '@angular/forms';

@Component({
    selector: 'app-modal-config',
    templateUrl: './general-config.component.html',
})

export class GeneralConfigComponent extends AppBaseComponent implements OnInit, AfterViewInit {
    public modalHeader: string;
    public modalContent: string;
    public submitted: boolean;
    public config: any = {};

    constructor( 
        private router: Router, 
        private ref: ChangeDetectorRef,
        private configService: GeneralConfigService,
        protected authService: AuthService,
        private injector: Injector
        ) {  super(injector); }

    ngOnInit() {
        this.submitted = false;
    }

    ngAfterViewInit(): void {
        this.loadConfiguration();
    }

    public setConfiguration(){
        this.submitted = true;
        let message;
        this.configService.saveConfiguration(this.config, 'pt-br').subscribe(result => {
            this.messageService.setLanguage(this.config.linguagem);
            setTimeout(()=> {
                message = this.messageService.getTranslation('MENSAGEM_CONFIGURACOES_SALVAS');
                this.messageService.success(message);
            }, 200);   
        }, (error: any) => {
            message = this.messageService.getTranslation('MENSAGEM_ERRO_SALVAR_CONFIGS');
            this.messageService.error(message, "Oops..");
        });
    } 

    private loadConfiguration(){
        let user: User = new User();
        user = this.authService.getLocalUser();
        this.configService.getConfiguration(user.email).subscribe((result: ConfigModel) => {
            this.config.linguagem = result.language;
            this.config.layout = result.openFacConfig.KeyboardLayout;
            this.config.sensor = result.openFacConfig.ActiveSensor;
            this.config.tipoVarredura = result.openFacConfig.ScanType;
            this.config.tmpVarreduraLns = result.openFacConfig.ScanTimeLines;
            this.config.tmpVarreduraCls = result.openFacConfig.ScanTimeColumns;
            this.config.lastKeyboard = result.lastKeyboard;
        }, (error: any) => {
            let message = this.messageService.getTranslation('MENSAGEM_ERRO_BUSCAR_CONFIGS');
            this.messageService.error(message, "Oops..");
        });
    }
}