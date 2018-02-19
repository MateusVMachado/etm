//import { ConfigService } from '../config.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-modal-config',
    templateUrl: './config.modal.html',
    styleUrls: ['./config.modal.scss']
})
export class ConfigModalComponent implements OnInit {
    public modalHeader: string;
    public modalContent: string;
    public value = {};
    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit() { 
        //this.value = this.configService.text;
        //console.log(this.value);
    }

    public closeModal() {
        this.activeModal.close();
    }
}