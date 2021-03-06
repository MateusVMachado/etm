import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { User } from '../shared/models/user';
import { TimeIntervalUnit, UserSessionModel } from '../shared/models/userSession.model';
import { AuthService } from '../shared/services/auth.services';
import { BackLoggerService } from '../shared/services/backLogger.service';
import { ConfigModel } from './config.model';
import { GeneralConfigService } from './general-config.service';




@Component({
    selector: 'app-modal-config',
    templateUrl: './general-config.component.html',
})

export class GeneralConfigComponent extends AppBaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public modalHeader: string;
    public modalContent: string;
    public submitted: boolean;
    public config: any = {};

    public level: number;

    private userSession: UserSessionModel;
    private timeInterval: TimeIntervalUnit;

    private levelSubscription: Subscription;

    private configServiceSubscribe: Subscription;
    private setConfigurationSubscribe: Subscription;

    constructor( 
        private router: Router, 
        private ref: ChangeDetectorRef,
        private configService: GeneralConfigService,
        protected authService: AuthService,
        private injector: Injector,
        private backLoggerService: BackLoggerService
        ) {  
            super(injector); 

             
            this.userSession = new UserSessionModel();
            this.userSession.configIntervals = new Array();
            this.timeInterval = new TimeIntervalUnit();

            this.timeInterval.inTime = moment().format("HH:mm:ss");



            let user = this.authService.getLocalUser();
            this.userSession.user = user.email; 

            this.configServiceSubscribe = this.configService.getConfiguration(user.email).subscribe((result)=>{
                
                this.level = 1-result.level;
            })

        }

    ngOnDestroy() {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.timeInterval.outTime = moment().format('HH:mm:ss');
        this.userSession.configIntervals.push(this.timeInterval);
        this.backLoggerService.sendConfigIntervalNow(this.userSession).subscribe(()=>{   });
        
        if(this.configServiceSubscribe) this.configServiceSubscribe.unsubscribe();
        if(this.setConfigurationSubscribe) this.setConfigurationSubscribe.unsubscribe();
    }

    ngOnInit() {
        this.submitted = false;
    }

    ngAfterViewInit(): void {
        this.loadConfiguration();
    }

    public setConfiguration(){
        this.submitted = true;
        let message;
        this.configServiceSubscribe.unsubscribe();
        this.setConfigurationSubscribe = this.configService.saveConfiguration(this.config, 'pt-br', 1-this.level).subscribe(result => {
            
            setTimeout(()=> {
                message = this.messageService.getTranslation('MENSAGEM_CONFIGURACOES_SALVAS');
                this.messageService.success(message);
                this.configService.emitGeneralConfigPayload(this.level);
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
            this.config.layout = result.openFacConfig.KeyboardLayout;
            this.config.sensor = result.openFacConfig.ActiveSensor;
            this.config.tipoVarredura = result.openFacConfig.ScanType;
            this.config.tmpVarreduraLns = result.openFacConfig.ScanTimeLines;
            this.config.tmpVarreduraCls = result.openFacConfig.ScanTimeColumns;
            this.config.lastKeyboard = result.lastKeyboard;
            this.config.flexSup = result.flexSup;
            this.config.flexUnd = result.flexUnd;
        }, (error: any) => {
            let message = this.messageService.getTranslation('MENSAGEM_ERRO_BUSCAR_CONFIGS');
            this.messageService.error(message, "Oops..");
        });
    }
}