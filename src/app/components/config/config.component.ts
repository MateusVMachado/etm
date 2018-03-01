import { AppBaseComponent } from '../shared/components/app-base.component';
import { User } from '../shared/models/user';
import { AuthService } from '../shared/services/auth.services';
import { JWTtoken } from '../../storage';
import { ConfigModel } from './config';
import { ConfigService } from './config.service';
import { NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, Input, OnInit, Injectable } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'app-modal-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss']
})

export class ConfigModalComponent extends AppBaseComponent implements OnInit, AfterViewInit {
    public modalHeader: string;
    public modalContent: string;
    public submitted: boolean;
    public config: any = {};

    constructor(
        private activeModal: NgbActiveModal, 
        private router: Router, 
        private ref: ChangeDetectorRef,
        private modalService: NgbModal,
        private configService: ConfigService,
        protected authService: AuthService,
        private injector: Injector
        ) {  super(injector); }

    ngOnInit() {
        this.submitted = false;
    }

    ngAfterViewInit(): void {
        this.loadConfiguration();
    }

    show(): void {
        const activeModal = this.modalService.open(ConfigModalComponent, { size: 'lg', container: 'nb-layout' });
    }

    public closeModal() {
        this.activeModal.close();
    }

    public setConfiguration(){
        this.submitted = true;
        this.configService.saveConfiguration(this.config, 'pt-br').subscribe(result => {
        }, (error: any) => {
            this.closeModal();
            this.messageService.error("Ocorreu um problema ao salvar suas configurações", "Oops..");
        });
        this.closeModal();
    } 

    private loadConfiguration(){
        let user: User = new User();
        user = this.authService.getUser();
        this.configService.getConfiguration(user.email).subscribe((result: ConfigModel) => {
            this.config.linguagem = result.language;
            this.config.layout = result.openFacConfig.KeyboardLayout;
            this.config.sensor = result.openFacConfig.ActiveSensor;
            this.config.tipoVarredura = result.openFacConfig.ScanType;
            this.config.tmpVarredura = result.openFacConfig.ScanTime;
            this.config.lastKeyboard = result.lastKeyboard;
        }, (error: any) => {
            this.messageService.error("Ocorreu um problema ao buscar suas configurações", "Oops..");
        });
    }
}