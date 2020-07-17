import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {OglasModel} from '../../modeli/oglas.model';
import {OglasiService} from '../oglasi.service';
import {MarkaModelService} from '../marka-model.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SlikaDodavanje} from '../../modeli/slikaDodavanje.model';
import {Slika} from '../../modeli/slika.model';
import {Marka} from '../../modeli/marka.model';
import {Model} from '../../modeli/model.model';
import {GorivoService} from '../gorivo.service';
import {MenjacService} from '../menjac.service';
import {Gorivo} from '../../modeli/gorivo.model';
import {Menjac} from '../../modeli/menjac.model';

declare var paypal;

@Component({
    selector: 'app-dodaj-oglas',
    templateUrl: './dodaj-oglas.page.html',
    styleUrls: ['./dodaj-oglas.page.scss'],
})
export class DodajOglasPage implements OnInit {

    constructor(private oglasiService: OglasiService,
                private markaModelService: MarkaModelService,
                private router: Router,
                private route: ActivatedRoute,
                private fb: FormBuilder,
                private gorivoService: GorivoService,
                private menjacService: MenjacService
    ) {
    }

    // @ViewChild('f', {static: false}) addForm: NgForm;
    form: FormGroup;

    izabran: Marka;

    oglas: OglasModel = null;

    menjaci: Menjac[] = [];

    godista: number[] = [];

    gorivo: Gorivo[] = [];

    marke: Marka[] = [];

    selectedMarke: Model[];

    edit = false;

    idOglas: number;

    @ViewChild('paypal', {static: true}) paypalElement: ElementRef;

    paidFor = false;

    popunjenaForma = false;

    isLoading = false;

    listaSlika: SlikaDodavanje[] = [];

    ucitavanjeSlika = false;

    @ViewChild('fileinput', {static: true}) fileinput: ElementRef;

    selektovanaMarka: Marka;

    onSubmit() {
        this.oglas = this.form.value;
        console.log(this.oglas);

        if (this.edit === true) {
            this.oglas.id = this.idOglas;
            this.oglasiService.updateOglas(this.oglas);
            this.form.reset();
            this.router.navigate(['/moji_oglasi']);
        } else {
            this.oglas.slike = this.listaSlika.map(slikaDod => {
                const slika: Slika = new Slika();
                slika.slika = slikaDod.hes;
                slika.id = null;
                return slika;
            });
            this.popunjenaForma = true;

            // this.oglasiService.addOglas(this.oglas);
        }
        // this.form.reset();
        // this.router.navigate(['/moji_oglasi']);
    }

    ngOnInit(): void {
        this.gorivoService.getGoriva().subscribe(goriva => {
            this.gorivo = goriva;
        });
        this.menjacService.getMenjaci().subscribe(menjaci => {
            this.menjaci = menjaci;
        });

        const godina = new Date().getFullYear();
        for (let i = godina; i > 1913; i--) {
            this.godista.push(i);
        }
        this.markaModelService.getAll()
            .subscribe(podaci => {
                this.marke = podaci;
                this.route.paramMap.subscribe((paramMap) => {
                    if (paramMap.has('id')) {
                        this.edit = true;
                        this.idOglas = Number.parseInt(paramMap.get('id'));
                        this.oglasiService.getOglas(this.idOglas)
                            .subscribe((oglas) => {
                                this.oglas = oglas;
                                // this.oglas.slike.forEach(slika => {
                                //     let slicica;
                                //     slicica.id = slika.id;
                                //     slicica.slika = slika.slika;
                                //     this.listaSlika.push({hes: slika.id, slika: slika.slika});
                                // }); ovo je sluzilo da bismo prikazali slike koje su novo-dodate u editu

                                this.onSelektovanaMarka2(this.oglas.model);

                                this.form = new FormGroup({
                                    naslov: new FormControl(oglas.naslov, Validators.required),
                                    opis: new FormControl(oglas.opis, Validators.required),
                                    marka: new FormControl(oglas.model.marka, Validators.required),
                                    model: new FormControl(oglas.model, Validators.required),
                                    cena: new FormControl(oglas.cena, Validators.required),
                                    gorivo: new FormControl(oglas.gorivo, Validators.required),
                                    kilometraza: new FormControl(oglas.kilometraza, Validators.required),
                                    kubikaza: new FormControl(oglas.kubikaza, Validators.required),
                                    godiste: new FormControl(oglas.godiste + '', Validators.required),
                                    menjac: new FormControl(oglas.menjac, Validators.required),
                                    // slika: new FormControl(oglas.slika, Validators.required),
                                    snaga: new FormControl(oglas.snaga, Validators.required)
                                });

                                console.log(oglas.model);

                            });
                    } else {
                        this.edit = false;
                    }
                });
                console.log(this.gorivo);
            });

        this.form = new FormGroup({
            naslov: new FormControl(null, Validators.required),
            opis: new FormControl(null, Validators.required),
            marka: new FormControl(null, Validators.required),
            model: new FormControl(null, Validators.required),
            cena: new FormControl(null, Validators.required),
            gorivo: new FormControl(null, Validators.required),
            kilometraza: new FormControl(null, Validators.required),
            kubikaza: new FormControl(null, Validators.required),
            godiste: new FormControl(null, Validators.required),
            menjac: new FormControl(null, Validators.required),
            // slika: new FormControl(null, Validators.required),
            snaga: new FormControl(null, Validators.required)
        });

        paypal
            .Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                description: 'bas super oglas',
                                amount: {
                                    currency_code: 'USD',
                                    value: 2
                                }
                            }
                        ]
                    });
                },
                onApprove: async (data, actions) => {
                    // console.log(data);
                    // console.log(actions);
                    this.isLoading = true;
                    // const order = await actions.order.capture();//radimo capture na beku
                    this.paidFor = true;
                    // console.log(order);
                    this.oglasiService.addOglas(this.oglas, data.orderID);
                    this.popunjenaForma = false;
                    this.isLoading = false;
                    this.form.reset();
                },
                onError: err => {
                    console.log(err);
                    this.isLoading = false;
                }
            })
            .render(this.paypalElement.nativeElement);
    }

    onSelektovanaMarka(e) {
        console.log('on selektovano 1');
        console.log(e);
        this.form.controls.model.reset();
        this.izabran = e.detail.value;
        if (e.detail.value !== '') {
            this.markaModelService.getModeliZaMarku(this.izabran.id)
                .subscribe(podaci => {
                    this.selectedMarke = podaci;
                });
        }
    }

    async onSelektovanaMarka2(model: Model) {
        // this.izabran = this.form.value.marka;
        console.log('on selektovano 2');
        const markaId = model.marka.id;
        await this.markaModelService.getModeliZaMarku(markaId)
            .subscribe(podaci => {
                this.selectedMarke = podaci;
                this.form.patchValue({model: this.oglas.model});
            });
    }

    ionViewWillEnter() {
        this.paidFor = false;
        this.isLoading = false;
        this.popunjenaForma = false;
    }

    onSelectFile(event: Event) {
        this.ucitavanjeSlika = true;
        const files = (event.target as HTMLInputElement).files;
        if (files && files[0]) {
            // const reader = new FileReader();
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.readAsDataURL(files[i]); // read file as data url
                console.log('ucitan fajl ' + i);
                reader.onload = () => { // called once readAsDataURL is completed
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
        this.ucitavanjeSlika = false;
    }

    obrisiSliku(hes: string) {
        this.oglasiService.obrisiSliku(hes);
        for (let i = 0; i < this.listaSlika.length; i++) {
            if (this.listaSlika[i].hes === hes) {
                this.listaSlika.splice(i, 1);
            }
        }
        // console.log(this.fileinput.nativeElement.files);
    }

    obrisiSlikuEdit(idOglas: number, idSlike: number) {
        this.oglasiService.obrisiSlikuEdit(idOglas, idSlike);
        for (let i = 0; i < this.oglas.slike.length; i++) {
            if (this.oglas.slike[i].id === idSlike) {
                this.oglas.slike.splice(i, 1);
            }
        }
    }

    comparePoID(m1: any, m2: any): boolean {
        return m1 && m2 ? m1.id === m2.id : m1 === m2;
    }

    // onSelectFileEdit(event: Event) {
    //     // this.ucitavanjeSlika = true;
    //     const files = (event.target as HTMLInputElement).files;
    //     if (files && files[0]) {
    //         // const reader = new FileReader();
    //         // tslint:disable-next-line:prefer-for-of
    //         for (let i = 0; i < files.length; i++) {
    //             const reader = new FileReader();
    //             reader.readAsDataURL(files[i]); // read file as data url
    //             console.log('ucitan fajl ' + i);
    //             reader.onload =  () => { // called once readAsDataURL is completed
    //                 this.oglasiService.posaljiSlikuEdit(this.idOglas, reader.result)
    //                     .subscribe(slika => {
    //                         this.oglas.slike.push(slika.slika);
    //                     });
    //             };
    //             // for (const lista of this.listaSlika) {
    //             //     console.log(lista);
    //             // }
    //         }
    //     }
    //     // this.ucitavanjeSlika = false;
    // }
}
