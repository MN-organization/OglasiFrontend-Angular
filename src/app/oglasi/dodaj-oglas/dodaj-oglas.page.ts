import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, NgForm} from '@angular/forms';
import {OglasModel} from '../../modeli/oglas.model';
import {OglasiService} from '../oglasi.service';
import {MarkaModelService} from '../marka-model.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';

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

    onSubmit() {
        this.oglas = this.form.value;
        console.log(this.oglas);

        if (this.edit === true) {
            this.oglas.id = this.idOglas;
            this.oglasiService.updateOglas(this.oglas);
        } else {
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
                        this.form.patchValue({model: oglas.model});
                        // this.oglas._id = oglas._id;
                        this.form = new FormGroup({
                            naslov: new FormControl(oglas.naslov),
                            opis: new FormControl(oglas.opis),
                            marka: new FormControl(oglas.marka),
                            model: new FormControl(oglas.model),
                            cena: new FormControl(oglas.cena),
                            gorivo: new FormControl(oglas.gorivo),
                            kilometraza: new FormControl(oglas.kilometraza),
                            kubikaza: new FormControl(oglas.kubikaza),
                            godiste: new FormControl(oglas.godiste + ''),
                            menjac: new FormControl(oglas.menjac),
                            slika: new FormControl(oglas.slika),
                            snaga: new FormControl(oglas.snaga)
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
            naslov: new FormControl(null),
            opis: new FormControl(null),
            marka: new FormControl(null),
            model: new FormControl(null),
            cena: new FormControl(null),
            gorivo: new FormControl(null),
            kilometraza: new FormControl(null),
            kubikaza: new FormControl(null),
            godiste: new FormControl(null),
            menjac: new FormControl(null),
            slika: new FormControl(null),
            snaga: new FormControl(null)
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
                    const order = await actions.order.capture();
                    this.paidFor = true;
                    console.log(order);
                    this.oglasiService.addOglas(this.oglas);
                    this.popunjenaForma = false;
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
}
