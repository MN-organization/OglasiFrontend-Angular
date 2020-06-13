import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MarkaModelService} from '../marka-model.service';
import {OglasiService} from '../oglasi.service';
import {Router} from '@angular/router';
import {Marka} from '../../modeli/marka.model';
import {Model} from '../../modeli/model.model';

@Component({
    selector: 'app-pretraga',
    templateUrl: './pretraga.page.html',
    styleUrls: ['./pretraga.page.scss'],
})
export class PretragaPage implements OnInit {

    form: FormGroup;

    izabran: Marka;

    menjaci = ['Manuelni', 'Automatski'];

    godista: number[] = [];

    gorivo = ['benzin', 'dizel', 'tng'];

    marke: Marka[] = [];

    selectedMarke: Model[] = [];

    constructor(private markaModelService: MarkaModelService, private oglasiService: OglasiService, private router: Router) {
    }

    ngOnInit() {
        this.form = new FormGroup({
            marka: new FormControl(null),
            model: new FormControl(null),
            gorivo: new FormControl(null),
            godOd: new FormControl(null),
            godDo: new FormControl(null),
            ccmOd: new FormControl(null),
            ccmDo: new FormControl(null),
            ksOd: new FormControl(null),
            ksDo: new FormControl(null),
            menjac: new FormControl(null),
            kmOd: new FormControl(null),
            kmDo: new FormControl(null),
            cenaOd: new FormControl(null),
            cenaDo: new FormControl(null),
        });

        const godina = new Date().getFullYear();
        for (let i = godina; i > 1913; i--) {
            this.godista.push(i);
        }
        this.markaModelService.getAll()
            .subscribe(podaci => {
                this.marke = podaci;
            });

    }


    onSelektovanaMarka(e) {
        // this.form.controls.model.reset();
        // this.izabran = e.detail.value;
        // for (const m of this.marke) {
        //     if (m.naziv === this.izabran) {
        //         this.selectedMarke = m.model;
        //     }
        // }

        // console.log('on selektovano 1');
        this.form.controls.model.reset();
        this.izabran = e.detail.value;
        if (e.detail.value !== '') {
            this.markaModelService.getModeliZaMarku(this.izabran.id)
                .subscribe(podaci => {
                    this.selectedMarke = podaci;
                });
        }
    }

    onSubmit() {
        console.log(this.form.value);
        this.oglasiService.pretrazi(this.form.value);
        this.router.navigate(['/rezultati_pretrage']);
    }

    onGorivoCancel() {
        this.form.patchValue({gorivo: null});
    }
    onMarkaCancel() {
        console.log('marka cancel');
        this.form.patchValue({marka: null});
    }
    onModeliCancel() {
        this.form.patchValue({model: null});
    }
    onGodisteOdCancel() {
        this.form.patchValue({godOd: null});
    }
    onGodisteDoCancel() {
        this.form.patchValue({godDo: null});
    }


}
