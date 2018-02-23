import { NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: 'app-modal-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss']
})
export class ConfigModalComponent implements OnInit {
    public modalHeader: string;
    public modalContent: string;
    public submitted: boolean;
    public config: any = {};

    constructor(
        private activeModal: NgbActiveModal, 
        private router: Router, 
        private ref: ChangeDetectorRef,
        private modalService: NgbModal
    ) { }

    ngOnInit() {
        this.submitted = false;
    }

    show(): void {
        const activeModal = this.modalService.open(ConfigModalComponent, { size: 'lg', container: 'nb-layout' });
    }

    public closeModal() {
        this.activeModal.close();
    }

    public setConfiguration(){
        this.submitted = true;
        this.closeModal();
    }
}