import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {OglasModel} from '../../modeli/oglas.model';
import {OglasiService} from '../oglasi.service';
import {MarkaModelService} from '../marka-model.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {SlikaDodavanje} from '../../modeli/slika.model';

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
                private route: ActivatedRoute) {
    }

    // @ViewChild('f', {static: false}) addForm: NgForm;
    form: FormGroup;

    izabran: string;

    oglas: OglasModel = null;

    menjaci = ['Manuelni', 'Automatski'];

    godista: number[] = [];

    gorivo = ['benzin', 'dizel', 'tng'];

    marke = [];

    selectedMarke = [];

    edit = false;

    idOglas: number;

    @ViewChild('paypal', {static: true}) paypalElement: ElementRef;

    paidFor = false;

    popunjenaForma = false;

    isLoading = false;

    listaSlika: SlikaDodavanje[] = [];

    ucitavanjeSlika = false;

    @ViewChild('fileinput', {static: true}) fileinput: ElementRef;

    onSubmit() {
        this.oglas = this.form.value;
        console.log(this.oglas);

        if (this.edit === true) {
            this.oglas.id = this.idOglas;
            this.oglasiService.updateOglas(this.oglas);
        } else {
            this.oglas.slike = this.listaSlika.map(slikaDod => {
                return slikaDod.hes;
            });
            this.popunjenaForma = true;

            // this.oglasiService.addOglas(this.oglas);
        }
        // this.form.reset();
        // this.router.navigate(['/moji_oglasi']);
    }

    ngOnInit(): void {
        const godina = new Date().getFullYear();
        for (let i = godina; i > 1913; i--) {
            this.godista.push(i);
        }
        this.marke = this.markaModelService.getAll();

        this.route.paramMap.subscribe((paramMap) => {
            if (paramMap.has('id')) {
                this.edit = true;
                this.idOglas = Number.parseInt(paramMap.get('id'));
                this.oglasiService.getOglas(this.idOglas)
                    .subscribe((oglas) => {
                        this.oglas = oglas;
                        this.form.patchValue({model: oglas.model});
                        // this.oglas._id = oglas._id;
                        this.form = new FormGroup({
                            naslov: new FormControl(oglas.naslov, Validators.required),
                            opis: new FormControl(oglas.opis, Validators.required),
                            marka: new FormControl(oglas.marka, Validators.required),
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
                        this.onSelektovanaMarka2(oglas.model);
                        console.log(oglas.model);
                        // this.form.patchValue({model: oglas.model});
                    });
            } else {
                this.edit = false;
            }
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
                    console.log(data);
                    console.log(actions);
                    this.isLoading = true;
                    const order = await actions.order.capture();
                    this.paidFor = true;
                    console.log(order);
                    this.oglasiService.addOglas(this.oglas);
                    this.popunjenaForma = false;
                    this.isLoading = false;
                    this.form.reset();
                    // capture treba da se odradi na beku i ako uspe onda se dodaje u bazu
                },
                onError: err => {
                    console.log(err);
                }
            })
            .render(this.paypalElement.nativeElement);
    }

    onSelektovanaMarka(e) {
        this.form.controls.model.reset();
        this.izabran = e.detail.value;
        for (const m of this.marke) {
            if (m.naziv === this.izabran) {
                this.selectedMarke = m.model;
            }
        }
    }

    onSelektovanaMarka2(model: string) {
        this.izabran = this.form.value.marka;
        // popunjavanje dropdowna za model
        for (const m of this.marke) {
            if (m.naziv === this.izabran) {
                this.selectedMarke = m.model;
            }
        }
        this.form.patchValue({model});
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

    }

    onSelectFileEdit(event: Event) {
        // this.ucitavanjeSlika = true;
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
                // for (const lista of this.listaSlika) {
                //     console.log(lista);
                // }
            }
        }
        // this.ucitavanjeSlika = false;
    }
}
