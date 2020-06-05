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


    getOglas(id: string) {
        this.isLoadingSubject.next(true);
        return this.http.get<{ oglas: OglasModel, poruka: string }>(BackendConst.backendAddress + '/api/oglasi/' + id).pipe(
            map(res => {
                return res.oglas;
                this.isLoadingSubject.next(false);
            })
        );
    }

    addOglas(oglas: OglasModel) {
        this.http.post<{ oglas: OglasModel, poruka: string }>(BackendConst.backendAddress + '/api/oglasi/dodaj', {
            naslov: oglas.naslov,
            opis: oglas.opis,
            cena: oglas.cena,
            marka: oglas.marka,
            model: oglas.model,
            godiste: oglas.godiste,
            kilometraza: oglas.kilometraza,
            gorivo: oglas.gorivo,
            snaga: oglas.snaga,
            kubikaza: oglas.kubikaza,
            menjac: oglas.menjac,
            slika: oglas.slika
        }).subscribe(
        );
    }


    pretrazi(forma: any) {
        let params = new HttpParams();
        if (forma.marka) {
            params = params.append('marka', forma.marka);
        }
        if (forma.model) {
            params = params.append('model', forma.model);
        }
        if (forma.gorivo) {
            params = params.append('gorivo', forma.gorivo);
        }
        if (forma.cenaOd) {
            params = params.append('cenaOd', forma.cenaOd);
        }
        if (forma.cenaDo) {
            params = params.append('cenaDo', forma.cenaDo);
        }
        if (forma.kmOd) {
            params = params.append('kmOd', forma.kmOd);
        }
        if (forma.kmDo) {
            params = params.append('kmDo', forma.kmDo);
        }
        if (forma.ccmOd) {
            params = params.append('ccmOd', forma.ccmOd);
        }
        if (forma.ccmDo) {
            params = params.append('ccmDo', forma.ccmDo);
        }
        if (forma.ksOd) {
            params = params.append('ksOd', forma.ksOd);
        }
        if (forma.ksDo) {
            params = params.append('ksDo', forma.ksDo);
        }
        if (forma.godOd) {
            params = params.append('godOd', forma.godOd);
        }
        if (forma.godDo) {
            params = params.append('godDo', forma.godDo);
        }
        if (forma.menjac) {
            params = params.append('menjac', forma.menjac);
        }
        this.isLoadingSubject.next(true);
        return this.http.get<{ oglas: OglasModel[], poruka: string }>(BackendConst.backendAddress + '/oglasi/pretraga', {params}).subscribe(
            (response) => {
                console.log(response);
                this.isLoadingSubject.next(false);
                this.listaOglasaPretraga = response.oglas;
                this.promena.next(this.listaOglasaPretraga);
            }
        );
    }

    delete(oglasId: string) {
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

    sacuvajOglas(idOglas: string) {
        console.log(idOglas);
        this.http.put<{ poruka: string }>(BackendConst.backendAddress + '/api/oglasi/sacuvaj', {oglasID: idOglas})
            .subscribe(podaci => {
                console.log(podaci);
            });
    }


    izbrisiSacuvanOglas(id: string) {
        this.http.put<{ poruka: string }>(BackendConst.backendAddress + '/api/oglasi/izbrisiSacuvan', {oglasID: id})
            .subscribe(podaci => {
                console.log(podaci);
                // this.getSacuvaniOglasi();
            });
    }
}
