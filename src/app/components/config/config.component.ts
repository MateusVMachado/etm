//import { ConfigService } from './config.service';
import { ConfigModalComponent } from './configModal/config.modal';
import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    
    selector: 'app-config',
    templateUrl: './config.component.html'
})
export class ConfigTecladoComponent implements OnInit, AfterViewInit {
   public op = ['Português', 'Inglês']
    constructor(private modalService: NgbModal) {}

    ngOnInit() {
        /*this.configService.text = {
            pt: 'pt-br',
            en: 'en'
        };*/
     }

    public showLargeModal() {
        const activeModal = this.modalService.open(ConfigModalComponent, { size: 'lg', container: 'nb-layout' });
        activeModal.componentInstance.modalHeader = 'Configurações';
    }

    public ngAfterViewInit(): void {
        this.showLargeModal();
    }
}