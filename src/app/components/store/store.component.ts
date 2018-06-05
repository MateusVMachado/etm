import { AfterViewInit, Component, HostListener, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import { isUndefined } from 'util';
import { OpenFACLayout } from '../layout-editor/layout.model';
import { AppBaseComponent } from '../shared/components/app-base.component';
import { TecladoCompartilhadoModel } from '../shared/models/teclado_compartilhado';
import { AuthService } from '../shared/services/auth.services';
import { TecladoCompartilhadoService } from '../shared/services/teclado_compartilhado.service';
import { SideBarService } from '../sidebar/sidebar.service';

@Component({
    selector: 'app-store',
    templateUrl: './store.component.html',
    styleUrls: ['./store.component.css']
})

export class StoreComponent extends AppBaseComponent implements OnInit, AfterViewInit, OnDestroy {
    
    teclado : OpenFACLayout
    listaTeclados : TecladoCompartilhadoModel[]
    listaTecladosInicial : TecladoCompartilhadoModel[]
    
    //PESQUISA
    formPesquisa : FormGroup
    mostraFiltros = false;
    filtrosInicial = true;
    
    //MODAL USE
    mostraModalUse = false;
    formUsar : FormGroup
    tecladoCompartId : string
    
    //MODAL COMPARTILHE
    mostraModalCompartilhar = false;
    formCompartilhe : FormGroup
    modalCompartilheMsg = false;
    tecladoUrl;
    
    //PAGINATION
    selectedPage : number
    
    //SUBSCRIPTIONS
    private getListaTecladosCompartilhadosSubscription: Subscription;
    private usarTecladoSubscription: Subscription;
    private setTecladoUsadoSubscription: Subscription;
    private getNotaSubscription: Subscription[];
    
    constructor (private tecladoCompartilhadoService : TecladoCompartilhadoService,
        private authService : AuthService, private formBuilder : FormBuilder,
        private router : Router,
        private activatedRoute : ActivatedRoute,protected injector: Injector,
        private sidebarService : SideBarService){super(injector)}
        
        //Clicando em ESC, os modais fecham
        //Clicando em ENTER, se o pesquisar estiver ativo, a pesquisa é feita
        @HostListener('window:keyup', ['$event'])
        atalhosEvent(event: KeyboardEvent) {
            if (event.keyCode === 27) {
                this.mostraModalCompartilhar = false;
                this.mostraModalUse = false;
            }
            else if ($('#cPesquisa').is(':focus') && event.keyCode === 13) {
                this.pesquisar(this.formPesquisa.controls["cPesquisa"].value);    
            }
        }
        
        ngOnInit() {
            this.getListaTecladosCompartilhadosSubscription =  this.tecladoCompartilhadoService.getListaTecladosCompartilhados()
            .subscribe( (result : TecladoCompartilhadoModel[]) => {
                this.listaTeclados = result;
                this.selectedPage = 1;
                this.listaTecladosInicial = this.listaTeclados;
                
                //GET NOTAS DOS TECLADOS
                if(isUndefined(this.getNotaSubscription)) this.getNotaSubscription = [];
                this.listaTecladosInicial.forEach(element => {
                    this.getNotaSubscription.push(this.tecladoCompartilhadoService.getNota(element.id).subscribe(result => {
                        element.nota = result["value"] || 0;
                        element.numeroAvaliacoes = result["numero_aval"] || 0;
                    }));
                });
                //PEGUE O ID DO TECLADO ATRAVÉS DA URL
                let rotasParametro : string = this.activatedRoute.snapshot.params["id"];
                if(!isUndefined(rotasParametro)){
                    rotasParametro = atob(rotasParametro);
                    if (!isUndefined(this.listaTeclados.findIndex(x => x.id === rotasParametro))){
                        let tecladoAuxiliar : TecladoCompartilhadoModel = this.listaTeclados[this.listaTeclados.findIndex(x => x.id === String(rotasParametro))];
                        this.listaTeclados.splice(this.listaTeclados.findIndex(x => x.id === rotasParametro), 1);
                        this.listaTeclados.unshift(tecladoAuxiliar);
                        this.listaTecladosInicial = this.listaTeclados;
                    }
                }
            });
            
            
            //FORMS
            this.formPesquisa = this.formBuilder.group({
                cPesquisa: this.formBuilder.control('',[Validators.required]),
                selectEstrelas: this.formBuilder.control('0',[]),
                selectData: this.formBuilder.control('1',[]),
                hasImageFiltro: this.formBuilder.control(false,[]),
                hasImage: this.formBuilder.control(false,[]),
                hasVoiceFiltro: this.formBuilder.control(false,[]),
                hasVoice: this.formBuilder.control(false,[])
            })
            this.formUsar = this.formBuilder.group({
                tecladoNome: this.formBuilder.control('',[Validators.required])
            })
            this.formCompartilhe = this.formBuilder.group({
                tecladoUrl: this.formBuilder.control({value:'', disabled: true})
            })
        }
        ngAfterViewInit(){
            $( window ).resize(function() {
                let keys = $('.overflow .tamanho-button')
                keys.each(function() {
                    if($(this).has('input.notImage')){
                        $(this).css('width', ($('.main-content').innerWidth() * 0.9) / 14)
                        $(this).css('maxWidth', ($('.main-content').innerWidth() * 0.9) / 14)
                    }
                });
            });
        }
        ngOnDestroy(){
            if(this.usarTecladoSubscription) this.usarTecladoSubscription.unsubscribe();
            if(this.getListaTecladosCompartilhadosSubscription) this.getListaTecladosCompartilhadosSubscription.unsubscribe();
            if(this.getNotaSubscription){
                this.getNotaSubscription.forEach(element => {
                    element.unsubscribe();
                });
            } 
            if(this.setTecladoUsadoSubscription) this.getListaTecladosCompartilhadosSubscription.unsubscribe();
        }
        // FILTROS
        pesquisar(pesq : string, isFiltering? : boolean){
            this.filtrosInicial = false;
            if(pesq === undefined){
                pesq = this.formPesquisa.controls["cPesquisa"].value;
            }
            if(pesq === ''){
                this.listaTeclados = this.listaTecladosInicial;
                return;
            }
            let listaTecladosAux = []
            this.listaTecladosInicial.forEach((item: TecladoCompartilhadoModel) => {
                if(item.nameLayout.toLowerCase().indexOf(pesq.toLowerCase()) != -1){
                    listaTecladosAux.push(item);
                }
            });
            this.listaTeclados = listaTecladosAux;
            listaTecladosAux = [];
        }
        
        filtrar(redefinir? : boolean){
            if(redefinir){
                this.formPesquisa.controls["cPesquisa"].setValue('');
                this.formPesquisa.controls["selectEstrelas"].setValue(0);
                this.formPesquisa.controls["selectData"].setValue(1);
                this.formPesquisa.controls["hasImageFiltro"].setValue(false);
                this.formPesquisa.controls["hasVoiceFiltro"].setValue(false);
                this.formPesquisa.controls["hasImage"].setValue(false);
                this.formPesquisa.controls["hasVoice"].setValue(false);
                this.pesquisar('',true);
                this.selectedPage = 1;
                this.mostraFiltros = false;
                this.filtrosInicial = true;
                return;
            }
            this.pesquisar('',true);
            
            this.filtrosInicial = false;
            let estrelas = this.formPesquisa.controls["selectEstrelas"].value;
            let data = this.formPesquisa.controls["selectData"].value;
            let hasImageFiltro = this.formPesquisa.controls["hasImageFiltro"].value;
            let hasVoiceFiltro = this.formPesquisa.controls["hasVoiceFiltro"].value;
            let hasImage = this.formPesquisa.controls["hasImage"].value;
            let hasVoice = this.formPesquisa.controls["hasVoice"].value;
            let listaTecladosAux = []
            
            //FILTRAR
            this.listaTecladosInicial.forEach((item: TecladoCompartilhadoModel,i) => {
                let add = true;
                if((hasImageFiltro && item.keyboardImage !== Boolean(hasImage)) || (hasVoiceFiltro && item.keyboardVoice !== Boolean(hasVoice)) ){
                    add = false;
                }
                //FILTRO POR DATA
                let dataPublicacao : Date = new Date(item.dataPublicacao.split('/')[2]+'/'+item.dataPublicacao.split('/')[1]+'/'+item.dataPublicacao.split('/')[0]);
                let diferencaData = Date.now().valueOf() - dataPublicacao.valueOf();
                diferencaData = Math.floor(diferencaData / (24 * 60 * 60 * 1000));
                let arrayDiferencaData = [7,31,365]
                data = Number(data);
                switch (data) {
                    case 2:
                    if(!(diferencaData < arrayDiferencaData[0])){
                        add = false;
                    }
                    break;
                    case 3:
                    if(!(diferencaData < arrayDiferencaData[1])){
                        add = false;
                    }
                    break;
                    case 4:
                    if(!(diferencaData < arrayDiferencaData[2])){
                        add = false;
                    }
                    break;
                    default:
                    break;
                }
                if(estrelas != 0){
                    if(item.nota < estrelas){
                        add = false
                    }
                }
                if(add){
                    listaTecladosAux.push(item);
                }
            });
            this.listaTeclados = listaTecladosAux;
            this.selectedPage = 1;
            this.mostraFiltros = false;
        }
        desmarcarCheckbox(desmarcaImg : boolean){
            if(desmarcaImg){
                if(this.formPesquisa.controls["hasImageFiltro"].value){
                    this.formPesquisa.controls["hasImage"].setValue(false);
                }
            }
            else{
                if(this.formPesquisa.controls["hasVoiceFiltro"].value){
                    this.formPesquisa.controls["hasVoice"].setValue(false);
                }
            }
        }
        
        //PAGINATION
        pageChange(event){
            this.selectedPage = event;
            $('.scrollable-container').animate({scrollTop : $('#lista_teclados').offset().top},1000)
        }
        
        // MODALS
        showModalUse(arrayRecebido : any[]){
            this.teclado = arrayRecebido[0];
            let titulo = arrayRecebido[1];
            this.tecladoCompartId = arrayRecebido[2];
            this.mostraModalUse = true;
            this.formUsar.controls["tecladoNome"].setValue(titulo);
        }
        usarTeclado(){
            let teclado_nome = this.formUsar.controls["tecladoNome"].value;
            this.teclado.shared = false;
            this.teclado._id = undefined
            this.teclado.nameLayout = teclado_nome;
            
            this.usarTecladoSubscription =  this.tecladoCompartilhadoService.usarTeclado(this.teclado).subscribe((result : string) => {
                let resultado = result;
                if(resultado === 'saved'){
                    this.setTecladoUsadoSubscription = this.tecladoCompartilhadoService.setTecladoUsado(this.tecladoCompartId).subscribe();
                    this.sidebarService.emitSideBarCommand('reload');
                    this.router.navigate(['pages/editor-teclado'],{ queryParams: { target: teclado_nome } })
                }
                else if(resultado === 'maxNumber'){
                    $('#btn_usarTeclado').text(this.messageService.getTranslation('STORE_ITEM_MODAL_USAR_NUMERO_MAXIMO'));
                }
                else if(resultado === 'alreadyExist'){
                    $('#btn_usarTeclado').text(this.messageService.getTranslation('STORE_ITEM_MODAL_USAR_JA_EXISTENTE'))                    
                }
                else{
                    $('#btn_usarTeclado').text(this.messageService.getTranslation('STORE_ITEM_MODAL_USAR_TENTE_MAIS_TARDE'))                    
                }
            });
        }
        showModalCompartilhe(arrayRecebido : any[]){
            //arrayRecebido[0]= ID para a URL
            //arrayRecebido[1]= Teclado
            this.teclado = arrayRecebido[1]
            this.mostraModalCompartilhar = true;
            $('#tecladoUrl').select();

            // let url = "localhost:4200/#/pages/store/"+ btoa(arrayRecebido[0]);
            let url = "https://etm.korp.com.br/#/pages/store/"+ btoa(arrayRecebido[0]);

            this.formCompartilhe.controls["tecladoUrl"].setValue(url);
        }
        copiarUrl(){
            this.modalCompartilheMsg = true;
            let url = this.formCompartilhe.controls["tecladoUrl"].value
            var aux = document.createElement("input");
            aux.setAttribute("value", url);
            document.body.appendChild(aux);
            aux.select();
            document.execCommand("copy");
            document.body.removeChild(aux);
            Observable.timer(3000).subscribe(timer => this.modalCompartilheMsg = false);
        }
    }