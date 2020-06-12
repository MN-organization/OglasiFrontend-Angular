import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {OglasiService} from './oglasi.service';
import {OglasModel} from '../modeli/oglas.model';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {SlikaDodavanje} from '../modeli/slika.model';

@Component({
    selector: 'app-oglasi',
    templateUrl: './oglasi.page.html',
    styleUrls: ['./oglasi.page.scss'],
})
export class OglasiPage implements OnInit, OnDestroy {

    oglasi: OglasModel[] = [];

    promena: Subscription;

    isMojiOglasi = false;

    naslov: string;

    pocetna = false;

    isLoading = false;

    isloadingSub: Subscription;

    listaSlika: SlikaDodavanje[] = [];

    @ViewChild('fileinput', {static: true}) fileinput: ElementRef;

    constructor(private oglasiService: OglasiService,
                private route: Router) {
    }

    ngOnInit() {
        this.isloadingSub = this.oglasiService.isLoadingSubject.subscribe(bul => {
            this.isLoading = bul;
        });
        this.promena = this.oglasiService.promena
            .subscribe(lista => {
                console.log(lista);
                this.oglasi = lista;
            });
    }

    ionViewWillEnter() {
        if (this.route.url === '/oglasi') {
            this.oglasiService.getAllOglasi();
            this.naslov = 'Prodaja automobila MN - oglasi';
            this.pocetna = true;
        } else if (this.route.url === '/moji_oglasi') {
            this.isMojiOglasi = true;
            this.oglasiService.getMojiOglasi();
            this.naslov = 'Moji oglasi';
        } else if (this.route.url === '/rezultati_pretrage') {
            this.naslov = 'Rezultati pretrage';
            console.log('stari rezultati');
            this.oglasi = this.oglasiService.listaOglasaPretraga;
            setTimeout(() => {
                this.isLoading = false;
            }, 500); // ako za 500ms ne stignu novi rezultati pretrage,prikaze stare
        } else {
            this.oglasiService.getSacuvaniOglasi();
            this.naslov = 'Sacuvani oglasi';
        }
    }

    ngOnDestroy(): void {
        if (this.promena) {
            this.promena.unsubscribe();
        }
        if (this.isloadingSub) {
            this.isloadingSub.unsubscribe();
        }
    }



    onSelectFile(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files && files[0]) {
            // const reader = new FileReader();
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.readAsDataURL(files[i]); // read file as data url
                console.log('ucitan fajl ' + i);
                reader.onload =  () => { // called once readAsDataURL is completed
                     this.oglasiService.posaljiSliku(reader.result)
                        .subscribe(hes => {
                            console.log('usao u sub');
                            console.log(hes);
                            const readerResult = reader.result.toString();
                            this.listaSlika.push(new SlikaDodavanje(hes, readerResult));
                        });
                };
                for (const lista of this.listaSlika) {
                    console.log(lista);
                }
            }
        }
    }

    obrisiSliku(hes: string) {
        this.oglasiService.obrisiSliku(hes);
        for (let i = 0; i < this.listaSlika.length; i++) {
            if (this.listaSlika[i].hes === hes) {
                this.listaSlika.splice(i, 1);
            }
        }
        console.log(this.fileinput.nativeElement.files);
    }
}
