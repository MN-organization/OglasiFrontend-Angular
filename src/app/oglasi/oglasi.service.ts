import {Injectable} from '@angular/core';
import {OglasModel} from '../modeli/oglas.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {BackendConst} from '../backend-const';

@Injectable({
    providedIn: 'root'
})
export class OglasiService {

    listaOglasa: OglasModel[] = [];

    listaOglasaPretraga: OglasModel[] = [];


    promena = new Subject<OglasModel[]>();

    isLoadingSubject = new Subject<boolean>();

    kriterijumi = '';

    constructor(private http: HttpClient) {
    }

    getMojiOglasi() {
        this.isLoadingSubject.next(true);
        this.http.get<{ oglasi: OglasModel[], poruka: string }>(BackendConst.backendAddress + '/api/oglasi/moji')
            .subscribe(podaci => {
                this.isLoadingSubject.next(false);
                this.promena.next(podaci.oglasi);
            });
    }

    getAllOglasi() {
        this.isLoadingSubject.next(true);
        this.http.get<{ oglasi: OglasModel[], poruka: string }>(BackendConst.backendAddress + '/api/oglasi')
            .subscribe(res => {
                console.log(res);
                this.promena.next(res.oglasi);
                this.isLoadingSubject.next(false);
                console.log(res.oglasi);
            });
    }


    getOglas(id: number) {
        this.isLoadingSubject.next(true);
        return this.http.get<{ oglas: OglasModel, poruka: string }>(BackendConst.backendAddress + '/api/oglasi/' + id).pipe(
            map(res => {
                this.isLoadingSubject.next(false);
                return res.oglas;
            })
        );
    }

    addOglas(oglas: OglasModel) {
        this.http.post<{ oglas: OglasModel, poruka: string }>(BackendConst.backendAddress + '/api/oglasi/dodaj', {
            naslov: oglas.naslov,
            opis: oglas.opis,
            cena: oglas.cena,
            marka: oglas.model.marka,
            model: oglas.model,
            godiste: oglas.godiste,
            kilometraza: oglas.kilometraza,
            gorivo: oglas.gorivo,
            snaga: oglas.snaga,
            kubikaza: oglas.kubikaza,
            menjac: oglas.menjac,
            slike: oglas.slike
        }).subscribe(
        );
    }


    dodajKriterijum(kriterijum: string) {
        if (this.kriterijumi === '') {
            this.kriterijumi = kriterijum;
        } else {
            this.kriterijumi = this.kriterijumi + ' AND ' + kriterijum;
        }
    }

    pretrazi(forma: any) {
        this.kriterijumi = '';
        if (forma.marka && !forma.model) {
            this.dodajKriterijum('model.marka.id:' + forma.marka.id);
        }
        if (forma.model) {
            console.log(forma.model);
            this.dodajKriterijum('model.id:' + forma.model.id);
        }
        if (forma.gorivo) {
            this.dodajKriterijum('gorivo:' + forma.gorivo);
        }
        if (forma.cenaOd) {
            this.dodajKriterijum('cena>' + forma.cenaOd);
        }
        if (forma.cenaDo) {
            this.dodajKriterijum('cena<' + forma.cenaDo);
        }
        if (forma.kmOd) {
            this.dodajKriterijum('kilometraza>' + forma.kmOd);
        }
        if (forma.kmDo) {
            this.dodajKriterijum('kilometraza<' + forma.kmDo);
        }
        if (forma.ccmOd) {
            this.dodajKriterijum('kubikaza>' + forma.ccmOd);
        }
        if (forma.ccmDo) {
            this.dodajKriterijum('kubikaza<' + forma.ccmDo);
        }
        if (forma.ksOd) {
            this.dodajKriterijum('snaga>' + forma.ksOd);
        }
        if (forma.ksDo) {
            this.dodajKriterijum('snaga<' + forma.ksDo);
        }
        if (forma.godOd) {
            this.dodajKriterijum('godiste>' + forma.godOd);
        }
        if (forma.godDo) {
            this.dodajKriterijum('godiste<' + forma.godDo);
        }
        if (forma.menjac) {
            this.dodajKriterijum('menjac:>' + forma.menjac);
        }

        this.isLoadingSubject.next(true);
        return this.http.get<{ oglasi: OglasModel[], poruka: string }>(BackendConst.backendAddress + '/api/oglasi/pretraga?search=(' + this.kriterijumi + ')').subscribe(
            (response) => {
                console.log(response);
                this.isLoadingSubject.next(false);
                this.listaOglasaPretraga = response.oglasi;
                this.promena.next(this.listaOglasaPretraga);
            }
        );
    }

    delete(oglasId: number) {
        this.http.delete(BackendConst.backendAddress + '/api/oglasi/' + oglasId)
            .subscribe(poruka => {
                console.log('deleted');
                this.getMojiOglasi();
            });
    }

    updateOglas(oglas: OglasModel) {
        this.http.post(BackendConst.backendAddress + '/api/oglasi/' + oglas.id, oglas)
            .subscribe(podaci => {
                console.log(podaci);
            });
    }

    getSacuvaniOglasi() {
        this.isLoadingSubject.next(true);
        this.http.get<{ oglasi: OglasModel[], poruka: string }>(BackendConst.backendAddress + '/api/oglasi/sacuvani')
            .subscribe(podaci => {
                podaci.oglasi.forEach(og => {
                    og.sacuvan = true;
                });
                this.isLoadingSubject.next(false);
                this.promena.next(podaci.oglasi);
            });
    }

    sacuvajOglas(idOglas: number) {
        console.log(idOglas);
        this.http.get<{ poruka: string }>(BackendConst.backendAddress + '/api/oglasi/sacuvaj/' + idOglas)
            .subscribe(podaci => {
                console.log(podaci);
            });
    }


    izbrisiSacuvanOglas(id: number) {
        this.http.get<{ poruka: string }>(BackendConst.backendAddress + '/api/oglasi/izbrisiSacuvan/' + id)
            .subscribe(podaci => {
                console.log(podaci);
                // this.getSacuvaniOglasi();
            });
    }

    posaljiSliku(slika: string | ArrayBuffer) {
        return this.http.post<{hes: string}>
        (BackendConst.backendAddress + '/api/oglasi/slike/', slika).pipe(
            map(res => {
                return res.hes;
            }));
    }

    obrisiSliku(hes: string) {
        this.http.delete(BackendConst.backendAddress + '/api/oglasi/slike/obrisi/' + hes)
            .subscribe(podaci => {
                console.log(podaci);
            });
    }


    // posaljiSlikuEdit(idOglas: number, slika: string | ArrayBuffer) {
    //     return this.http.post<{slika: {id: number, slika: string}, poruka: string}>
    //     (BackendConst.backendAddress + '/api/oglasi/slike/edit/' + idOglas, slika)
    //         .pipe(map( podaci => {
    //             return podaci.slika;
    //         }));
    // }
    obrisiSlikuEdit(idOglas: number, idSlike: number) {
        this.http.delete
        (BackendConst.backendAddress + '/api/oglasi/slike/obrisi/' + idOglas + '/' + idSlike)
            .subscribe();
    }
}
